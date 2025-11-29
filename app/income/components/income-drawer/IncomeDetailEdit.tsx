"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  User,
  Receipt,
  FileText,
  CreditCard,
  Pencil,
  Tag,
} from "lucide-react";
import {
  IncomeEntry,
  IncomeStatus,
  STATUS_CONFIG,
  CATEGORIES,
  VatType,
} from "../../types";
import { formatFullDate } from "../../utils";

interface IncomeDetailEditProps {
  entry: IncomeEntry;
  onSave: (entry: IncomeEntry) => void;
  onCancel: () => void;
  onStatusChange: (id: number | string, status: IncomeStatus) => void;
}

export function IncomeDetailEdit({
  entry,
  onSave,
  onCancel,
  onStatusChange,
}: IncomeDetailEditProps) {
  const [editedEntry, setEditedEntry] = React.useState<IncomeEntry>({ ...entry });

  const handleSave = () => {
    onSave(editedEntry);
  };

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
              <Input
                value={editedEntry.description}
                onChange={(e) =>
                  setEditedEntry({
                    ...editedEntry,
                    description: e.target.value,
                  })
                }
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>

          {/* Client */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                לקוח
              </p>
              <Input
                value={editedEntry.client}
                onChange={(e) =>
                  setEditedEntry({
                    ...editedEntry,
                    client: e.target.value,
                  })
                }
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                קטגוריה
              </p>
              <Select
                value={editedEntry.category || ""}
                onValueChange={(v) =>
                  setEditedEntry({ ...editedEntry, category: v })
                }
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Input
              value={editedEntry.amountGross}
              onChange={(e) =>
                setEditedEntry({
                  ...editedEntry,
                  amountGross: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 w-24 text-sm text-left"
              dir="ltr"
            />
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              מע״מ
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={editedEntry.vatType}
                onValueChange={(v) =>
                  setEditedEntry({
                    ...editedEntry,
                    vatType: v as VatType,
                  })
                }
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="חייב מע״מ">חייב מע״מ</SelectItem>
                  <SelectItem value="ללא מע״מ">ללא מע״מ</SelectItem>
                  <SelectItem value="כולל מע״מ">כולל מע״מ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              סטטוס
            </span>
            <Select
              value={editedEntry.status || ""}
              onValueChange={(v) =>
                onStatusChange(entry.id, v as IncomeStatus)
              }
            >
              <SelectTrigger className="h-8 w-28 text-xs border-0 bg-transparent p-0 justify-end">
                {editedEntry.status && STATUS_CONFIG[editedEntry.status] ? (
                  <Badge
                    className={cn(
                      "text-[10px] px-2.5 py-0.5 rounded-full font-medium border",
                      STATUS_CONFIG[editedEntry.status].bgClass,
                      STATUS_CONFIG[editedEntry.status].textClass,
                      STATUS_CONFIG[editedEntry.status].borderClass
                    )}
                  >
                    {STATUS_CONFIG[editedEntry.status].label}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {(["נשלחה", "שולם"] as IncomeStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <SelectItem key={status} value={status}>
                      <Badge
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                          config.bgClass,
                          config.textClass,
                          config.borderClass
                        )}
                      >
                        {config.label}
                      </Badge>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          הערות
        </h3>
        <div className="pr-6">
          <textarea
            value={editedEntry.notes || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, notes: e.target.value })
            }
            placeholder="הוסף הערות..."
            className="w-full h-20 text-sm p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            שמור שינויים
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            ביטול
          </Button>
        </div>
      </div>
    </div>
  );
}

