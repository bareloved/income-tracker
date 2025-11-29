"use client";

import * as React from "react";
import { IncomeEntry, IncomeStatus, FilterType, KPIData } from "../types";
import {
  generateId,
  getWeekday,
  getTodayDateString,
  calculateKPIs,
  filterByMonth,
  isOverdue,
  isPastDate,
  getDisplayStatus,
} from "../utils";

// Mock data for development - will be replaced with Supabase
const createMockData = (): IncomeEntry[] => [
  {
    id: 1,
    date: "2025-11-01",
    weekday: "ש",
    description: "הופעה עם תזמורת קאמרית - אודיטוריום חיפה",
    amountGross: 1800,
    amountPaid: 0,
    client: "תזמורת קאמרית חיפה",
    status: "נשלחה",
    vatType: "כולל מע״מ",
    invoiceSentDate: "2025-11-02",
    category: "הופעות",
  },
  {
    id: 2,
    date: "2025-11-03",
    weekday: "ב",
    description: "הפקת שיר - מיקס ומאסטר",
    amountGross: 2500,
    amountPaid: 2500,
    client: "דניאל לוי",
    status: "שולם",
    vatType: "חייב מע״מ",
    invoiceSentDate: "2025-11-04",
    paidDate: "2025-11-10",
    category: "הפקה",
  },
  {
    id: 3,
    date: "2025-11-05",
    weekday: "ד",
    description: "הקלטת פסנתר - אלבום ג׳אז",
    amountGross: 800,
    amountPaid: 0,
    client: "סטודיו הצליל",
    status: "בוצע",
    vatType: "חייב מע״מ",
    category: "הקלטות",
  },
  {
    id: 4,
    date: "2025-11-08",
    weekday: "ש",
    description: "חתונה - ערב שלם",
    amountGross: 3500,
    amountPaid: 0,
    client: "משפחת כהן",
    status: "בוצע",
    vatType: "כולל מע״מ",
    category: "הופעות",
  },
  {
    id: 5,
    date: "2025-11-10",
    weekday: "ב",
    description: "שיעור פסנתר פרטי x4",
    amountGross: 400,
    amountPaid: 400,
    client: "יעל אברהם",
    status: "שולם",
    vatType: "ללא מע״מ",
    paidDate: "2025-11-10",
    category: "הוראה",
  },
  {
    id: 6,
    date: "2025-11-12",
    weekday: "ד",
    description: "עיבוד תזמורתי - 3 שירים",
    amountGross: 4500,
    amountPaid: 0,
    client: "להקת הגשם",
    status: "נשלחה",
    vatType: "חייב מע״מ",
    invoiceSentDate: "2025-10-01", // Old - overdue!
    category: "עיבודים",
  },
  {
    id: 7,
    date: "2025-11-15",
    weekday: "ש",
    description: "אירוע תאגידי - קוקטייל",
    amountGross: 2000,
    amountPaid: 0,
    client: "חברת הייטק",
    status: "בוצע",
    vatType: "כולל מע״מ",
    category: "הופעות",
  },
  {
    id: 8,
    date: "2025-11-18",
    weekday: "ב",
    description: "הפקת ג׳ינגל פרסומת",
    amountGross: 3000,
    amountPaid: 1500,
    client: "משרד פרסום",
    status: "נשלחה",
    vatType: "חייב מע״מ",
    invoiceSentDate: "2025-11-19",
    category: "הפקה",
  },
  {
    id: 9,
    date: "2025-11-22",
    weekday: "ש",
    description: "קונצרט קלאסי - בית האופרה",
    amountGross: 2200,
    amountPaid: 2200,
    client: "התזמורת הפילהרמונית",
    status: "שולם",
    vatType: "כולל מע״מ",
    invoiceSentDate: "2025-11-23",
    paidDate: "2025-11-28",
    category: "הופעות",
  },
  {
    id: 10,
    date: "2025-11-25",
    weekday: "ב",
    description: "סדנת אימפרוביזציה",
    amountGross: 1200,
    amountPaid: 0,
    client: "קונסרבטוריון תל אביב",
    status: "בוצע",
    vatType: "חייב מע״מ",
    category: "הוראה",
  },
];

// Mock previous month data for trend calculation
const MOCK_PREVIOUS_MONTH_PAID = 8500;

interface UseIncomeStateReturn {
  // Data
  entries: IncomeEntry[];
  filteredEntries: IncomeEntry[];
  kpis: KPIData;
  clients: string[];

  // Filters
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;

  // Actions
  addEntry: (entry: Omit<IncomeEntry, "id" | "weekday">) => void;
  updateEntry: (entry: IncomeEntry) => void;
  deleteEntry: (id: number) => void;
  updateStatus: (id: number, status: IncomeStatus) => void;
  markAsPaid: (id: number) => void;
  markInvoiceSent: (id: number) => void;
  duplicateEntry: (entry: IncomeEntry) => void;

  // Drawer
  selectedEntry: IncomeEntry | null;
  isDrawerOpen: boolean;
  openDrawer: (entry: IncomeEntry) => void;
  closeDrawer: () => void;
}

export function useIncomeState(): UseIncomeStateReturn {
  // Core state
  const [entries, setEntries] = React.useState<IncomeEntry[]>(createMockData);

  // Filter state
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [selectedMonth, setSelectedMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear()
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  // Drawer state
  const [selectedEntry, setSelectedEntry] = React.useState<IncomeEntry | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Get unique clients for autocomplete
  const clients = React.useMemo(() => {
    const uniqueClients = new Set(entries.map((e) => e.client));
    return Array.from(uniqueClients).sort();
  }, [entries]);

  // Filter entries based on all criteria
  const filteredEntries = React.useMemo(() => {
    let result = entries;

    // Month/Year filter
    result = filterByMonth(result, selectedMonth, selectedYear);

    // Status filter (using derived display status)
    switch (activeFilter) {
      case "ready-to-invoice":
        // Past gigs that haven't been invoiced or paid
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
  }, [entries, selectedMonth, selectedYear, activeFilter, searchQuery, sortDirection]);

  // Calculate KPIs
  const kpis = React.useMemo(
    () =>
      calculateKPIs(entries, selectedMonth, selectedYear, MOCK_PREVIOUS_MONTH_PAID),
    [entries, selectedMonth, selectedYear]
  );

  // Actions
  const addEntry = React.useCallback(
    (entry: Omit<IncomeEntry, "id" | "weekday">) => {
      const newEntry: IncomeEntry = {
        ...entry,
        id: generateId(entries),
        weekday: getWeekday(new Date(entry.date)),
      };
      setEntries((prev) => [newEntry, ...prev]);
    },
    [entries]
  );

  const updateEntry = React.useCallback((updatedEntry: IncomeEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    // Also update selected entry if it's the one being updated
    setSelectedEntry((prev) =>
      prev?.id === updatedEntry.id ? updatedEntry : prev
    );
  }, []);

  const deleteEntry = React.useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntry((prev) => (prev?.id === id ? null : prev));
    setIsDrawerOpen((prev) => (selectedEntry?.id === id ? false : prev));
  }, [selectedEntry?.id]);

  const updateStatus = React.useCallback(
    (id: number, status: IncomeStatus) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;

          const updates: Partial<IncomeEntry> = { status };

          // Add timestamps based on status
          if (status === "נשלחה" && !e.invoiceSentDate) {
            updates.invoiceSentDate = getTodayDateString();
          }
          if (status === "שולם") {
            updates.paidDate = getTodayDateString();
            updates.amountPaid = e.amountGross;
          }

          return { ...e, ...updates };
        })
      );
    },
    []
  );

  const markAsPaid = React.useCallback((id: number) => {
    updateStatus(id, "שולם");
  }, [updateStatus]);

  const markInvoiceSent = React.useCallback((id: number) => {
    updateStatus(id, "נשלחה");
  }, [updateStatus]);

  const duplicateEntry = React.useCallback(
    (entry: IncomeEntry) => {
      const today = new Date();
      const newEntry: IncomeEntry = {
        ...entry,
        id: generateId(entries),
        date: getTodayDateString(),
        weekday: getWeekday(today),
        status: "בוצע",
        amountPaid: 0,
        invoiceSentDate: undefined,
        paidDate: undefined,
      };
      setEntries((prev) => [newEntry, ...prev]);
    },
    [entries]
  );

  // Drawer actions
  const openDrawer = React.useCallback((entry: IncomeEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  }, []);

  return {
    entries,
    filteredEntries,
    kpis,
    clients,
    activeFilter,
    setActiveFilter,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    sortDirection,
    setSortDirection,
    addEntry,
    updateEntry,
    deleteEntry,
    updateStatus,
    markAsPaid,
    markInvoiceSent,
    duplicateEntry,
    selectedEntry,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
}

