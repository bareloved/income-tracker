"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CalendarDays, ListX, Plus, X } from "lucide-react";
import { IncomeEntry, IncomeStatus } from "../types";
import { IncomeTableHeader } from "./income-table/IncomeTableHeader";
import { IncomeTableQuickAdd } from "./income-table/IncomeTableQuickAdd";
import { IncomeTableRow } from "./income-table/IncomeTableRow";
import { IncomeTableTotals } from "./income-table/IncomeTableTotals";

interface IncomeTableProps {
  entries: IncomeEntry[];
  clients: string[];
  onRowClick: (entry: IncomeEntry) => void;
  onStatusChange: (id: number | string, status: IncomeStatus) => void;
  onMarkAsPaid: (id: number | string) => void;
  onMarkInvoiceSent: (id: number | string) => void;
  onDuplicate: (entry: IncomeEntry) => void;
  onDelete: (id: number | string) => void;
  onAddEntry: (entry: Omit<IncomeEntry, "id" | "weekday">) => void;
  onClearFilter?: () => void;
  hasActiveFilter: boolean;
  sortDirection: "asc" | "desc";
  onSortToggle: () => void;
}

export function IncomeTable({
  entries,
  clients,
  onRowClick,
  onStatusChange,
  onMarkAsPaid,
  onMarkInvoiceSent,
  onDuplicate,
  onDelete,
  onAddEntry,
  onClearFilter,
  hasActiveFilter,
  sortDirection,
  onSortToggle,
}: IncomeTableProps) {
  const hasNoData = entries.length === 0 && !hasActiveFilter;
  const hasFilteredAway = entries.length === 0 && hasActiveFilter;

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm print:shadow-none print:border-slate-200">
      <div className="relative w-full overflow-x-auto overflow-y-visible">
        <Table className="table-fixed w-full min-w-full">
          <IncomeTableHeader
            sortDirection={sortDirection}
            onSortToggle={onSortToggle}
          />
          <TableBody>
            {/* Quick Add Row */}
            <IncomeTableQuickAdd onAddEntry={onAddEntry} clients={clients} />

            {/* Empty States */}
            {hasNoData && (
              <TableRow>
                <TableCell colSpan={6} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <CalendarDays className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      אין עבודות לחודש הזה
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      התחל על ידי הוספת עבודה חדשה
                    </p>
                    <Button
                      onClick={() => {
                        // Focus logic could be handled via ref passed to QuickAdd if needed,
                        // but for now we'll rely on the user clicking the input in the QuickAdd row.
                        // Or we could expose a method from QuickAdd.
                        // Given "Simple Solutions", let's just let the user click the input.
                        const input = document.querySelector(
                          'input[placeholder="הוסף עבודה חדשה"]'
                        ) as HTMLInputElement;
                        input?.focus();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף עבודה ראשונה
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {hasFilteredAway && (
              <TableRow>
                <TableCell colSpan={6} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <ListX className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      אין עבודות שמתאימות לסינון הזה
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      נסה לשנות את הסינון או לנקות אותו
                    </p>
                    <Button
                      variant="outline"
                      onClick={onClearFilter}
                      className="border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <X className="h-4 w-4 ml-2" />
                      נקה סינון
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {entries.map((entry, index) => (
              <IncomeTableRow
                key={entry.id}
                entry={entry}
                index={index}
                onRowClick={onRowClick}
                onStatusChange={onStatusChange}
                onMarkAsPaid={onMarkAsPaid}
                onMarkInvoiceSent={onMarkInvoiceSent}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}

            {/* Totals Row */}
            <IncomeTableTotals entries={entries} />
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
