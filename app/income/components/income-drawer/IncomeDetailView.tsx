"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Check,
  User,
  Receipt,
  FileText,
  X,
  CreditCard,
  Pencil,
  Clock,
  Tag,
} from "lucide-react";
import { IncomeEntry, STATUS_CONFIG } from "../../types";
import {
  formatCurrency,
  formatFullDate,
  daysSince,
  isOverdue,
  getDisplayStatus,
  isPastDate,
} from "../../utils";

interface IncomeDetailViewProps {
  entry: IncomeEntry;
  onEdit: () => void;
  onClose: () => void;
  onMarkAsPaid: (id: number | string) => void;
  onMarkInvoiceSent: (id: number | string) => void;
}

export function IncomeDetailView({
  entry,
  onEdit,
  onClose,
  onMarkAsPaid,
  onMarkInvoiceSent,
}: IncomeDetailViewProps) {
  const displayStatus = getDisplayStatus(entry);
  const statusConfig = displayStatus ? STATUS_CONFIG[displayStatus] : null;
  const vatAmount = entry.vatType === "ללא מע״מ" ? 0 : entry.amountGross * 0.17;
  const daysSinceInvoice = entry.invoiceSentDate
    ? daysSince(entry.invoiceSentDate)
    : null;
  const overdue = isOverdue(entry);

  return (
    <div className="space-y-6 py-6">
      {/* Work Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          פרטי עבודה
        </h3>

        <div className="space-y-3 pr-6">
          {/* Date */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                תאריך ביצוע
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {formatFullDate(entry.date)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <Pencil className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                תיאור
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {entry.description}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                לקוח
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {entry.client}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                קטגוריה
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {entry.category || "לא צוין"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400" />
          פרטי תשלום
        </h3>

        <div className="space-y-3 pr-6">
          {/* Amount Gross */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              סכום
            </span>
            <span
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums"
              dir="ltr"
            >
              {formatCurrency(entry.amountGross)}
            </span>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              מע״מ
            </span>
            <div className="flex items-center gap-2">
              <Badge className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200">
                {entry.vatType}
              </Badge>
              {vatAmount > 0 && (
                <span
                  className="text-xs text-slate-500 tabular-nums"
                  dir="ltr"
                >
                  ({formatCurrency(Math.round(vatAmount))})
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              סטטוס
            </span>
            {statusConfig ? (
              <Badge
                className={cn(
                  "text-[10px] px-2.5 py-0.5 rounded-full font-medium border",
                  statusConfig.bgClass,
                  statusConfig.textClass,
                  statusConfig.borderClass
                )}
              >
                {statusConfig.label}
              </Badge>
            ) : (
              <span className="text-xs text-slate-300">—</span>
            )}
          </div>

          {/* Invoice Sent Date */}
          {entry.invoiceSentDate && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                נשלחה
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-800 dark:text-slate-200">
                  {formatFullDate(entry.invoiceSentDate)}
                </span>
                {daysSinceInvoice !== null && (
                  <Badge
                    className={cn(
                      "text-[9px] px-1.5 py-0 font-medium border-0",
                      overdue
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {daysSinceInvoice}
                    <Clock className="h-2.5 w-2.5 mr-1" />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Paid Date */}
          {entry.paidDate && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                תאריך תשלום
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {formatFullDate(entry.paidDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          הערות
        </h3>
        <div className="pr-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md min-h-[60px]">
            {entry.notes || "אין הערות"}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        {/* Primary Actions based on status */}
        {displayStatus === "בוצע" && (
          <Button
            onClick={() => onMarkInvoiceSent(entry.id)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <FileText className="h-4 w-4 ml-2" />
            שלחתי חשבונית
          </Button>
        )}

        {displayStatus === "נשלחה" && (
          <Button
            onClick={() => onMarkAsPaid(entry.id)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Check className="h-4 w-4 ml-2" />
            התקבל תשלום
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onEdit}
          className="w-full"
        >
          <Pencil className="h-4 w-4 ml-2" />
          ערוך פרטים
        </Button>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-slate-500 hover:text-slate-700"
        >
          <X className="h-4 w-4 ml-2" />
          סגור
        </Button>
      </div>
    </div>
  );
}

