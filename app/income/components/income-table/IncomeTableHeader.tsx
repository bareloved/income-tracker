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
      {/* ═══════════════════════════════════════════════════════════════════════════
          TABLE HEADER - Column widths optimized for content
          - Date: 80px (compact, just DD.MM + weekday)
          - Description: 40% (flex, can be long)
          - Amount: 90px (currency values)
          - Client: 100px (narrowed - client names are usually short)
          - Status: 100px (badges)
          - Actions: 90px (moved closer to center)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <TableHead className="w-[50px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3 pr-3">
          <div className="flex items-center justify-end gap-0.5">
            <span>תאריך</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSortToggle}
              className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title={
                sortDirection === "desc"
                  ? "מיון יורד (חדש → ישן)"
                  : "מיון עולה (ישן → חדש)"
              }
            >
              {sortDirection === "desc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
            </Button>
          </div>
        </TableHead>
        <TableHead className="w-[30%] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3 pr-1">
          תיאור
        </TableHead>
        <TableHead className="w-[90px] py-3 px-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex justify-end">סכום</div>
        </TableHead>
        <TableHead className="w-[80px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          לקוח
        </TableHead>
        <TableHead className="w-[80px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          קטגוריה
        </TableHead>
        <TableHead className="w-[70px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3">
          סטטוס
        </TableHead>
        <TableHead className="w-[90px] text-right text-xs font-medium text-slate-600 dark:text-slate-400 py-3 print:hidden">
          פעולות
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

