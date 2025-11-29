"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface IncomeTableHeaderProps {
  sortDirection: "asc" | "desc";
  onSortToggle: () => void;
}

export function IncomeTableHeader({
  sortDirection,
  onSortToggle,
}: IncomeTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <TableHead className="w-[90px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          <div className="flex items-center justify-end gap-2">
            <span>תאריך</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSortToggle}
              className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title={
                sortDirection === "desc"
                  ? "מיון יורד (חדש → ישן)"
                  : "מיון עולה (ישן → חדש)"
              }
            >
              {sortDirection === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </TableHead>
        <TableHead className="w-[35%] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          תיאור
        </TableHead>
        <TableHead className="w-[100px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          סכום
        </TableHead>
        <TableHead className="w-[140px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          לקוח
        </TableHead>
        <TableHead className="w-[130px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          סטטוס
        </TableHead>
        <TableHead className="w-[100px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3 print:hidden">
          פעולות
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

