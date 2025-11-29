"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IncomeHeader } from "./components/IncomeHeader";
import { KPICards } from "./components/KPICards";
import { IncomeFilters } from "./components/IncomeFilters";
import { IncomeTable } from "./components/IncomeTable";
import { IncomeDetailDrawer } from "./components/IncomeDetailDrawer";
import { exportToCSV, isOverdue, isPastDate, getDisplayStatus, calculateKPIs, getWeekday, filterByMonth } from "./utils";
import {
  createIncomeEntryAction,
  updateIncomeEntryAction,
  markIncomeEntryAsPaidAction,
  markInvoiceSentAction,
  updateEntryStatusAction,
  deleteIncomeEntryAction,
} from "./actions";
import type { IncomeEntry, IncomeStatus, FilterType, KPIData } from "./types";
import type { IncomeAggregates } from "./data";
import type { IncomeEntry as DBIncomeEntry } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Props interface
// ─────────────────────────────────────────────────────────────────────────────

interface IncomePageClientProps {
  year: number;
  month: number;
  dbEntries: DBIncomeEntry[];
  aggregates: IncomeAggregates;
  clients: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper to convert DB entry to UI entry format
// ─────────────────────────────────────────────────────────────────────────────

function dbEntryToUIEntry(dbEntry: DBIncomeEntry): IncomeEntry {
  // Map DB status to Hebrew status
  let status: IncomeStatus = "בוצע";
  if (dbEntry.paymentStatus === "paid" || dbEntry.invoiceStatus === "paid") {
    status = "שולם";
  } else if (dbEntry.invoiceStatus === "sent") {
    status = "נשלחה";
  }

  // Map VAT type
  let vatType: "חייב מע״מ" | "ללא מע״מ" | "כולל מע״מ" = "חייב מע״מ";
  if (parseFloat(dbEntry.vatRate) === 0) {
    vatType = "ללא מע״מ";
  } else if (dbEntry.includesVat) {
    vatType = "כולל מע״מ";
  }

  return {
    id: dbEntry.id,
    date: dbEntry.date,
    weekday: getWeekday(new Date(dbEntry.date)),
    description: dbEntry.description,
    amountGross: parseFloat(dbEntry.amountGross),
    amountPaid: parseFloat(dbEntry.amountPaid),
    client: dbEntry.clientName,
    status,
    vatType,
    notes: dbEntry.notes ?? undefined,
    invoiceSentDate: dbEntry.invoiceSentDate ?? undefined,
    paidDate: dbEntry.paidDate ?? undefined,
    category: dbEntry.category ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────────────────────

export default function IncomePageClient({
  year,
  month,
  dbEntries,
  aggregates,
  clients: initialClients,
}: IncomePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Convert DB entries to UI format
  const initialEntries = React.useMemo(
    () => dbEntries.map(dbEntryToUIEntry),
    [dbEntries]
  );

  // Local state for entries (for optimistic updates)
  const [entries, setEntries] = React.useState<IncomeEntry[]>(initialEntries);

  // Update entries when props change (e.g., month/year navigation)
  React.useEffect(() => {
    setEntries(dbEntries.map(dbEntryToUIEntry));
  }, [dbEntries]);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  // Drawer state
  const [selectedEntry, setSelectedEntry] = React.useState<IncomeEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Selected month/year (controlled by URL)
  const selectedMonth = month;
  const selectedYear = year;

  // Get unique clients (combine initial with any new ones)
  const clients = React.useMemo(() => {
    const uniqueClients = new Set([
      ...initialClients,
      ...entries.map((e) => e.client),
    ]);
    return Array.from(uniqueClients).sort();
  }, [initialClients, entries]);

  // Calculate KPIs using aggregates from server
  const kpis: KPIData = React.useMemo(() => {
    // Recalculate some values locally for accurate filtered display
    const localKPIs = calculateKPIs(entries, selectedMonth, selectedYear, aggregates.previousMonthPaid);
    
    return {
      outstanding: aggregates.outstanding,
      readyToInvoice: aggregates.readyToInvoice,
      readyToInvoiceCount: aggregates.readyToInvoiceCount,
      thisMonth: localKPIs.thisMonth,
      thisMonthCount: localKPIs.thisMonthCount,
      trend: aggregates.trend,
      totalPaid: localKPIs.totalPaid, // Use local calculation for current filter
      overdueCount: aggregates.overdueCount,
      invoicedCount: aggregates.invoicedCount,
    };
  }, [entries, selectedMonth, selectedYear, aggregates]);

  // Filter entries based on all criteria
  const filteredEntries = React.useMemo(() => {
    let result = entries;

    // Status filter (using derived display status)
    switch (activeFilter) {
      case "ready-to-invoice":
        result = result.filter((e) => getDisplayStatus(e) === "בוצע");
        break;
      case "invoiced":
        result = result.filter((e) => getDisplayStatus(e) === "נשלחה");
        break;
      case "paid":
        result = result.filter((e) => getDisplayStatus(e) === "שולם");
        break;
      case "overdue":
        result = result.filter((e) => isOverdue(e));
        break;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(query) ||
          e.client.toLowerCase().includes(query) ||
          (e.category && e.category.toLowerCase().includes(query))
      );
    }

    // Sort by date
    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [entries, activeFilter, searchQuery, sortDirection]);

  // Dark mode effect
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMonthChange = (newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth.toString());
    params.set("year", selectedYear.toString());
    router.push(`/income?${params.toString()}`);
  };

  const handleYearChange = (newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear.toString());
    params.set("month", selectedMonth.toString());
    router.push(`/income?${params.toString()}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD handlers with server actions
  // ─────────────────────────────────────────────────────────────────────────────

  const addEntry = async (entry: Omit<IncomeEntry, "id" | "weekday">) => {
    const formData = new FormData();
    formData.append("date", entry.date);
    formData.append("description", entry.description);
    formData.append("clientName", entry.client);
    formData.append("amountGross", entry.amountGross.toString());
    formData.append("amountPaid", entry.amountPaid.toString());
    if (entry.category) formData.append("category", entry.category);
    if (entry.notes) formData.append("notes", entry.notes);

    // Map Hebrew status to DB status
    if (entry.status === "שולם") {
      formData.append("invoiceStatus", "paid");
      formData.append("paymentStatus", "paid");
    } else if (entry.status === "נשלחה") {
      formData.append("invoiceStatus", "sent");
    } else {
      formData.append("invoiceStatus", "draft");
    }

    // Map VAT type
    if (entry.vatType === "ללא מע״מ") {
      formData.append("vatRate", "0");
      formData.append("includesVat", "false");
    } else if (entry.vatType === "כולל מע״מ") {
      formData.append("includesVat", "true");
    } else {
      formData.append("includesVat", "false");
    }

    const result = await createIncomeEntryAction(formData);
    
    if (result.success && result.entry) {
      // Optimistically add to local state
      const newEntry = dbEntryToUIEntry(result.entry);
      setEntries((prev) => [newEntry, ...prev]);
    }
  };

  const updateEntry = async (updatedEntry: IncomeEntry) => {
    const formData = new FormData();
    formData.append("id", updatedEntry.id.toString());
    formData.append("date", updatedEntry.date);
    formData.append("description", updatedEntry.description);
    formData.append("clientName", updatedEntry.client);
    formData.append("amountGross", updatedEntry.amountGross.toString());
    formData.append("amountPaid", updatedEntry.amountPaid.toString());
    formData.append("category", updatedEntry.category || "");
    formData.append("notes", updatedEntry.notes || "");

    // Map Hebrew status to DB status
    if (updatedEntry.status === "שולם") {
      formData.append("invoiceStatus", "paid");
      formData.append("paymentStatus", "paid");
    } else if (updatedEntry.status === "נשלחה") {
      formData.append("invoiceStatus", "sent");
    } else {
      formData.append("invoiceStatus", "draft");
    }

    // Map VAT type
    if (updatedEntry.vatType === "ללא מע״מ") {
      formData.append("vatRate", "0");
      formData.append("includesVat", "false");
    } else if (updatedEntry.vatType === "כולל מע״מ") {
      formData.append("includesVat", "true");
    } else {
      formData.append("includesVat", "false");
    }

    // Optimistically update local state
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    setSelectedEntry((prev) =>
      prev?.id === updatedEntry.id ? updatedEntry : prev
    );

    await updateIncomeEntryAction(formData);
  };

  const deleteEntry = async (id: number | string) => {
    // Optimistically update local state
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntry((prev) => (prev?.id === id ? null : prev));
    if (selectedEntry?.id === id) {
      setIsDrawerOpen(false);
    }

    await deleteIncomeEntryAction(id.toString());
  };

  const updateStatus = async (id: number | string, status: IncomeStatus) => {
    // Optimistically update local state
    const today = new Date().toISOString().split("T")[0];
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updates: Partial<IncomeEntry> = { status };
        if (status === "נשלחה" && !e.invoiceSentDate) {
          updates.invoiceSentDate = today;
        }
        if (status === "שולם") {
          updates.paidDate = today;
          updates.amountPaid = e.amountGross;
        }
        return { ...e, ...updates };
      })
    );

    // Only call server action for "נשלחה" or "שולם" status changes
    if (status === "נשלחה" || status === "שולם") {
      await updateEntryStatusAction(id.toString(), status);
    }
  };

  const markAsPaid = async (id: number | string) => {
    // Optimistically update local state
    const today = new Date().toISOString().split("T")[0];
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          status: "שולם" as IncomeStatus,
          paidDate: today,
          amountPaid: e.amountGross,
        };
      })
    );

    await markIncomeEntryAsPaidAction(id.toString());
  };

  const markInvoiceSent = async (id: number | string) => {
    // Optimistically update local state
    const today = new Date().toISOString().split("T")[0];
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          status: "נשלחה" as IncomeStatus,
          invoiceSentDate: today,
        };
      })
    );

    await markInvoiceSentAction(id.toString());
  };

  const duplicateEntry = async (entry: IncomeEntry) => {
    const today = new Date();
    const newEntry: Omit<IncomeEntry, "id" | "weekday"> = {
      ...entry,
      date: today.toISOString().split("T")[0],
      status: "בוצע",
      amountPaid: 0,
      invoiceSentDate: undefined,
      paidDate: undefined,
    };
    await addEntry(newEntry);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Drawer handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const openDrawer = (entry: IncomeEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Export handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    exportToCSV(
      filteredEntries,
      `income-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <IncomeHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
        />

        {/* KPI Cards */}
        <KPICards
          kpis={kpis}
          selectedMonth={selectedMonth}
          onFilterClick={setActiveFilter}
          activeFilter={activeFilter}
        />

        {/* Filters */}
        <IncomeFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          clients={clients}
          readyToInvoiceCount={kpis.readyToInvoiceCount}
          overdueCount={kpis.overdueCount}
        />

        {/* Main Table */}
        <IncomeTable
          entries={filteredEntries}
          clients={clients}
          onRowClick={openDrawer}
          onStatusChange={updateStatus}
          onMarkAsPaid={markAsPaid}
          onMarkInvoiceSent={markInvoiceSent}
          onDuplicate={duplicateEntry}
          onDelete={deleteEntry}
          onAddEntry={addEntry}
          onClearFilter={() => setActiveFilter("all")}
          hasActiveFilter={activeFilter !== "all" || searchQuery !== ""}
          sortDirection={sortDirection}
          onSortToggle={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
        />

        {/* Keyboard shortcuts hint */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 print:hidden">
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
            N
          </span>{" "}
          עבודה חדשה
          <span className="mx-2">•</span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
            Enter
          </span>{" "}
          הוסף
          <span className="mx-2">•</span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
            Esc
          </span>{" "}
          סגור
        </div>
      </div>

      {/* Detail Drawer */}
      <IncomeDetailDrawer
        entry={selectedEntry}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onMarkAsPaid={markAsPaid}
        onMarkInvoiceSent={markInvoiceSent}
        onUpdate={updateEntry}
        onStatusChange={updateStatus}
      />
    </div>
  );
}

