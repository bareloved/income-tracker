// Income Entry Types

export type IncomeStatus = "בוצע" | "נשלחה" | "שולם";
export type VatType = "חייב מע״מ" | "ללא מע״מ" | "כולל מע״מ";

export interface IncomeEntry {
  id: number | string; // Support both numeric and UUID
  date: string; // When the work was done
  weekday: string;
  description: string;
  amountGross: number;
  amountPaid: number;
  client: string;
  status: IncomeStatus;
  vatType: VatType;
  notes?: string;
  // New fields for invoice tracking
  invoiceSentDate?: string; // When invoice was sent
  paidDate?: string; // When payment was received
  category?: string; // הופעות, הפקה, הקלטות, etc.
}

// Filter types
export type FilterType = "all" | "ready-to-invoice" | "invoiced" | "paid" | "overdue";

// Client for autocomplete
export interface Client {
  name: string;
  defaultRate?: number;
  category?: string;
}

// KPI data structure
export interface KPIData {
  outstanding: number; // מחכה לתשלום - invoiced but not paid
  readyToInvoice: number; // ממתין לחשבונית - work done, no invoice
  readyToInvoiceCount: number;
  thisMonth: number; // סה״כ החודש
  thisMonthCount: number;
  trend: number; // % vs last month
  totalPaid: number;
  overdueCount: number;
  invoicedCount: number; // Count of invoices waiting for payment
}

// Status config for UI
export const STATUS_CONFIG: Record<IncomeStatus, { 
  label: string; 
  bgClass: string; 
  textClass: string; 
  borderClass: string;
}> = {
  "בוצע": {
    label: "בוצע",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    textClass: "text-slate-600 dark:text-slate-400",
    borderClass: "border-slate-200 dark:border-slate-700",
  },
  "נשלחה": {
    label: "נשלחה",
    bgClass: "bg-amber-50 dark:bg-amber-900/30",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  "שולם": {
    label: "שולם",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/30",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
};

// Categories for musician workflow
export const CATEGORIES = [
  "הופעות",
  "הפקה",
  "הקלטות", 
  "הוראה",
  "עיבודים",
  "אחר",
] as const;

export type Category = typeof CATEGORIES[number];

