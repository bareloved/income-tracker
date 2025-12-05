"use client";

import * as React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, Currency, getDisplayStatus } from "../../utils";
import { IncomeEntry } from "../../types";

interface IncomeTableTotalsProps {
  entries: IncomeEntry[];
}

export function IncomeTableTotals({ entries }: IncomeTableTotalsProps) {
  // Calculate totals for visible entries
  const totals = React.useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const status = getDisplayStatus(entry);
        acc.totalGross = Currency.add(acc.totalGross, entry.amountGross);

        if (status === "שולם") {
          acc.paidSum = Currency.add(acc.paidSum, entry.amountPaid);
          acc.paidCount += 1;
        } else if (status === "נשלחה") {
          const outstanding = Currency.subtract(entry.amountGross, entry.amountPaid);
          acc.waitingSum = Currency.add(acc.waitingSum, outstanding);
          acc.waitingCount += 1;
        } else {
          acc.toInvoiceSum = Currency.add(acc.toInvoiceSum, entry.amountGross);
          acc.toInvoiceCount += 1;
        }

        return acc;
      },
      {
        totalGross: 0,
        paidSum: 0,
        waitingSum: 0,
        toInvoiceSum: 0,
        paidCount: 0,
        waitingCount: 0,
        toInvoiceCount: 0,
      }
    );
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════════
          TOTALS ROW - Now rendered inside a sticky container in parent component
          - Removed background styling (handled by parent sticky container)
          - Enhanced typography and spacing for better readability
          ═══════════════════════════════════════════════════════════════════════════ */}
      <TableRow className="hover:bg-transparent">
        <TableCell className="py-3.5 font-bold text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-base">סה״כ</span>
          </div>
        </TableCell>
        <TableCell className="py-3.5 font-semibold text-sm text-slate-600 dark:text-slate-400">
          {entries.length} עבודות
        </TableCell>
        <TableCell className="py-3.5 tabular-nums px-2">
          <div className="flex flex-col gap-0.5 items-end">
            {/* Total gross amount - prominent */}
            <span
              className="text-base font-bold text-slate-800 dark:text-slate-200 font-numbers"
              dir="ltr"
            >
              {formatCurrency(totals.totalGross)}
            </span>
            {/* Pending amount indicator */}
            {(totals.waitingSum + totals.toInvoiceSum) > 0 && (
              <span
                className="text-xs font-medium text-amber-600 dark:text-amber-400 font-numbers"
                dir="ltr"
              >
                {formatCurrency(totals.waitingSum + totals.toInvoiceSum)} ממתין
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="py-3.5" />
        <TableCell className="py-3.5">
          <div className="flex flex-col text-[11px] gap-0.5 text-slate-600 dark:text-slate-300" dir="ltr">
            <span>✓ {formatCurrency(totals.paidSum)} שולם</span>
            <span>⌛ {formatCurrency(totals.waitingSum)} מחכה</span>
            <span>📝 {formatCurrency(totals.toInvoiceSum)} לשלוח</span>
          </div>
        </TableCell>
        <TableCell className="py-3.5" />
        <TableCell className="py-3.5 print:hidden" />
      </TableRow>
    </>
  );
}
