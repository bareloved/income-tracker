import { db } from "@/db/client";
import { incomeEntries, type IncomeEntry, type NewIncomeEntry } from "@/db/schema";
import { eq, and, gte, lte, asc, desc, sql, count, sum } from "drizzle-orm";
import { Currency } from "./currency";

// ─────────────────────────────────────────────────────────────────────────────
// Types for data helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthFilter {
  year: number;
  month: number; // 1-12
}

export interface IncomeAggregates {
  totalGross: number;
  totalPaid: number;
  totalUnpaid: number;
  vatTotal: number;
  jobsCount: number;
  outstanding: number;        // Invoiced but not paid
  readyToInvoice: number;     // Done but not invoiced
  readyToInvoiceCount: number;
  invoicedCount: number;
  overdueCount: number;
  previousMonthPaid: number;  // For trend calculation
  trend: number;              // % vs previous month
}

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities
// ─────────────────────────────────────────────────────────────────────────────

function getMonthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Query functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all income entries for a specific month
 */
export async function getIncomeEntriesForMonth({ year, month }: MonthFilter): Promise<IncomeEntry[]> {
  const { startDate, endDate } = getMonthBounds(year, month);
  
  const entries = await db
    .select()
    .from(incomeEntries)
    .where(
      and(
        gte(incomeEntries.date, startDate),
        lte(incomeEntries.date, endDate)
      )
    )
    .orderBy(asc(incomeEntries.date), asc(incomeEntries.createdAt));
  
  return entries;
}

/**
 * Get all income entries (for cross-month calculations like outstanding invoices)
 */
export async function getAllIncomeEntries(): Promise<IncomeEntry[]> {
  const entries = await db
    .select()
    .from(incomeEntries)
    .orderBy(desc(incomeEntries.date));
  
  return entries;
}

/**
 * Calculate aggregates for a given month using optimized SQL queries
 */
export async function getIncomeAggregatesForMonth({ year, month }: MonthFilter): Promise<IncomeAggregates> {
  const { startDate, endDate } = getMonthBounds(year, month);
  const today = getTodayString();
  
  // 1. Current Month Aggregates
  const [monthStats] = await db
    .select({
      totalGross: sum(incomeEntries.amountGross).mapWith(Number),
      totalPaid: sum(incomeEntries.amountPaid).mapWith(Number),
      jobsCount: count(),
    })
    .from(incomeEntries)
    .where(
      and(
        gte(incomeEntries.date, startDate),
        lte(incomeEntries.date, endDate)
      )
    );

  // 2. Calculate VAT Total for current month (requires row-level logic due to conditional VAT)
  // We can use the entries fetch we'd need anyway for the list, or do a specific query.
  // Since `getIncomeEntriesForMonth` is usually called alongside this, we might be double fetching if we're not careful.
  // But for now, let's optimize the aggregate query itself.
  // Complex VAT calculation is hard to do in pure SQL without stored procedures or complex case statements 
  // that replicate the application logic. 
  // Let's fetch just the necessary columns for VAT calc for the month.
  const monthVatEntries = await db
    .select({
      amountGross: incomeEntries.amountGross,
      vatRate: incomeEntries.vatRate,
      includesVat: incomeEntries.includesVat,
    })
    .from(incomeEntries)
    .where(
      and(
        gte(incomeEntries.date, startDate),
        lte(incomeEntries.date, endDate)
      )
    );

  const vatTotal = monthVatEntries.reduce((acc, e) => {
    const amount = Currency.fromString(e.amountGross);
    const rate = Currency.divide(Currency.fromString(e.vatRate), 100);
    if (e.includesVat) {
      const vat = Currency.divide(Currency.multiply(amount, rate), Currency.add(1, rate));
      return Currency.add(acc, vat);
    }
    const vat = Currency.multiply(amount, rate);
    return Currency.add(acc, vat);
  }, 0);

  // 3. Outstanding (Invoiced but not paid - across all time)
  const [outstandingStats] = await db
    .select({
      totalGross: sum(incomeEntries.amountGross).mapWith(Number),
      totalPaid: sum(incomeEntries.amountPaid).mapWith(Number),
      count: count(),
    })
    .from(incomeEntries)
    .where(
      and(
        eq(incomeEntries.invoiceStatus, "sent"),
        sql`${incomeEntries.paymentStatus} != 'paid'`
      )
    );
  
  const outstanding = Currency.subtract(
    outstandingStats?.totalGross || 0, 
    outstandingStats?.totalPaid || 0
  );
  const invoicedCount = outstandingStats?.count || 0;

  // 4. Ready to Invoice (Past work, draft status - across all time)
  const [readyToInvoiceStats] = await db
    .select({
      total: sum(incomeEntries.amountGross).mapWith(Number),
      count: count(),
    })
    .from(incomeEntries)
    .where(
      and(
        eq(incomeEntries.invoiceStatus, "draft"),
        lt(incomeEntries.date, today) // strictly less than today
      )
    );

  // 5. Overdue Count (Invoice sent > 30 days ago)
  // Postgres interval: invoice_sent_date < (current_date - interval '30 days')
  const [overdueStats] = await db
    .select({ count: count() })
    .from(incomeEntries)
    .where(
      and(
        eq(incomeEntries.invoiceStatus, "sent"),
        sql`${incomeEntries.paymentStatus} != 'paid'`,
        sql`${incomeEntries.invoiceSentDate} < CURRENT_DATE - INTERVAL '30 days'`
      )
    );

  // 6. Previous Month Paid (for trend)
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const { startDate: prevStart, endDate: prevEnd } = getMonthBounds(prevYear, prevMonth);

  const [prevMonthStats] = await db
    .select({
      totalPaid: sum(incomeEntries.amountPaid).mapWith(Number),
    })
    .from(incomeEntries)
    .where(
      and(
        gte(incomeEntries.date, prevStart),
        lte(incomeEntries.date, prevEnd),
        eq(incomeEntries.paymentStatus, "paid")
      )
    );

  const totalGross = monthStats?.totalGross || 0;
  const totalPaid = monthStats?.totalPaid || 0;
  const totalUnpaid = Currency.subtract(totalGross, totalPaid);
  const previousMonthPaid = prevMonthStats?.totalPaid || 0;

  // Trend calculation
  const trend = previousMonthPaid > 0
    ? Currency.multiply(Currency.divide(Currency.subtract(totalPaid, previousMonthPaid), previousMonthPaid), 100)
    : 0;

  return {
    totalGross,
    totalPaid,
    totalUnpaid,
    vatTotal,
    jobsCount: monthStats?.jobsCount || 0,
    outstanding,
    readyToInvoice: readyToInvoiceStats?.total || 0,
    readyToInvoiceCount: readyToInvoiceStats?.count || 0,
    invoicedCount,
    overdueCount: overdueStats?.count || 0,
    previousMonthPaid,
    trend,
  };
}

// Need to import 'lt' from drizzle-orm
import { lt } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// CRUD operations (rest unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateIncomeEntryInput {
  date: string;
  description: string;
  clientName: string;
  amountGross: number;
  amountPaid?: number;
  vatRate?: number;
  includesVat?: boolean;
  invoiceStatus?: "draft" | "sent" | "paid" | "cancelled";
  paymentStatus?: "unpaid" | "partial" | "paid";
  category?: string;
  notes?: string;
  invoiceSentDate?: string;
  paidDate?: string;
}

/**
 * Create a new income entry
 */
export async function createIncomeEntry(input: CreateIncomeEntryInput): Promise<IncomeEntry> {
  const [entry] = await db
    .insert(incomeEntries)
    .values({
      date: input.date,
      description: input.description,
      clientName: input.clientName,
      amountGross: input.amountGross.toFixed(2),
      amountPaid: (input.amountPaid ?? 0).toFixed(2),
      vatRate: (input.vatRate ?? 17).toFixed(2),
      includesVat: input.includesVat ?? true,
      invoiceStatus: input.invoiceStatus ?? "draft",
      paymentStatus: input.paymentStatus ?? "unpaid",
      category: input.category,
      notes: input.notes,
      invoiceSentDate: input.invoiceSentDate,
      paidDate: input.paidDate,
    })
    .returning();
  
  return entry;
}

export interface UpdateIncomeEntryInput {
  id: string;
  date?: string;
  description?: string;
  clientName?: string;
  amountGross?: number;
  amountPaid?: number;
  vatRate?: number;
  includesVat?: boolean;
  invoiceStatus?: "draft" | "sent" | "paid" | "cancelled";
  paymentStatus?: "unpaid" | "partial" | "paid";
  category?: string;
  notes?: string;
  invoiceSentDate?: string | null;
  paidDate?: string | null;
}

/**
 * Update an existing income entry
 */
export async function updateIncomeEntry(input: UpdateIncomeEntryInput): Promise<IncomeEntry | null> {
  const { id, ...updates } = input;
  
  // Build the update object with only defined values
  const updateData: Partial<NewIncomeEntry> = {};
  
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.clientName !== undefined) updateData.clientName = updates.clientName;
  if (updates.amountGross !== undefined) updateData.amountGross = updates.amountGross.toFixed(2);
  if (updates.amountPaid !== undefined) updateData.amountPaid = updates.amountPaid.toFixed(2);
  if (updates.vatRate !== undefined) updateData.vatRate = updates.vatRate.toFixed(2);
  if (updates.includesVat !== undefined) updateData.includesVat = updates.includesVat;
  if (updates.invoiceStatus !== undefined) updateData.invoiceStatus = updates.invoiceStatus;
  if (updates.paymentStatus !== undefined) updateData.paymentStatus = updates.paymentStatus;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.invoiceSentDate !== undefined) updateData.invoiceSentDate = updates.invoiceSentDate ?? undefined;
  if (updates.paidDate !== undefined) updateData.paidDate = updates.paidDate ?? undefined;
  
  // Always update updatedAt
  updateData.updatedAt = new Date();
  
  const [entry] = await db
    .update(incomeEntries)
    .set(updateData)
    .where(eq(incomeEntries.id, id))
    .returning();
  
  return entry ?? null;
}

/**
 * Mark an entry as paid (full payment)
 */
export async function markIncomeEntryAsPaid(id: string): Promise<IncomeEntry | null> {
  // First get the entry to get amountGross
  const [existing] = await db
    .select()
    .from(incomeEntries)
    .where(eq(incomeEntries.id, id))
    .limit(1);
  
  if (!existing) return null;
  
  const today = getTodayString();
  
  const [entry] = await db
    .update(incomeEntries)
    .set({
      paymentStatus: "paid",
      invoiceStatus: "paid",
      amountPaid: existing.amountGross,
      paidDate: today,
      updatedAt: new Date(),
    })
    .where(eq(incomeEntries.id, id))
    .returning();
  
  return entry ?? null;
}

/**
 * Mark an entry as invoice sent
 */
export async function markInvoiceSent(id: string): Promise<IncomeEntry | null> {
  const today = getTodayString();
  
  const [entry] = await db
    .update(incomeEntries)
    .set({
      invoiceStatus: "sent",
      invoiceSentDate: today,
      updatedAt: new Date(),
    })
    .where(eq(incomeEntries.id, id))
    .returning();
  
  return entry ?? null;
}

/**
 * Delete an income entry
 */
export async function deleteIncomeEntry(id: string): Promise<boolean> {
  const result = await db
    .delete(incomeEntries)
    .where(eq(incomeEntries.id, id))
    .returning({ id: incomeEntries.id });
  
  return result.length > 0;
}

/**
 * Get unique client names from all entries
 */
export async function getUniqueClients(): Promise<string[]> {
  const results = await db
    .selectDistinct({ clientName: incomeEntries.clientName })
    .from(incomeEntries)
    .orderBy(asc(incomeEntries.clientName));
  
  return results.map((r) => r.clientName);
}
