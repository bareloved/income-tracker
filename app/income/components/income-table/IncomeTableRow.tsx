"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Check,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";
import { IncomeEntry, IncomeStatus, STATUS_CONFIG } from "../../types";
import {
  formatCurrency,
  formatDate,
  daysSince,
  isOverdue,
  getDisplayStatus,
  isPastDate,
} from "../../utils";

interface IncomeTableRowProps {
  entry: IncomeEntry;
  index: number;
  onRowClick: (entry: IncomeEntry) => void;
  onStatusChange: (id: number | string, status: IncomeStatus) => void;
  onMarkAsPaid: (id: number | string) => void;
  onMarkInvoiceSent: (id: number | string) => void;
  onDuplicate: (entry: IncomeEntry) => void;
  onDelete: (id: number | string) => void;
}

export function IncomeTableRow({
  entry,
  index,
  onRowClick,
  onStatusChange,
  onMarkAsPaid,
  onMarkInvoiceSent,
  onDuplicate,
  onDelete,
}: IncomeTableRowProps) {
  const displayStatus = getDisplayStatus(entry);
  const statusConfig = displayStatus ? STATUS_CONFIG[displayStatus] : null;
  const isEven = index % 2 === 0;
  const overdue = isOverdue(entry);
  const daysSinceInvoice = entry.invoiceSentDate
    ? daysSince(entry.invoiceSentDate)
    : null;
  const isFutureGig = !isPastDate(entry.date);

  return (
    <TableRow
      className={cn(
        "border-b border-slate-100 dark:border-slate-800 transition-colors group cursor-pointer",
        isEven
          ? "bg-white dark:bg-slate-900"
          : "bg-slate-50/40 dark:bg-slate-800/20",
        "hover:bg-slate-50/60 dark:hover:bg-slate-800/40",
        overdue && "bg-red-50/30 dark:bg-red-900/10"
      )}
      onClick={() => onRowClick(entry)}
    >
      {/* Date */}
      <TableCell className="font-medium py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-slate-800 dark:text-slate-200">
            {formatDate(entry.date)}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            ({entry.weekday})
          </span>
        </div>
      </TableCell>

      {/* Description */}
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
            {entry.description}
          </span>
          {entry.category && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {entry.category}
            </span>
          )}
        </div>
      </TableCell>

      {/* Amount */}
      <TableCell className="font-semibold tabular-nums py-3">
        <span
          className={cn(
            "text-sm",
            entry.status === "שולם"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-800 dark:text-slate-200"
          )}
          dir="ltr"
        >
          {formatCurrency(entry.amountGross)}
        </span>
      </TableCell>

      {/* Client */}
      <TableCell className="py-3 overflow-hidden">
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate block">
          {entry.client}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          {/* Future gig without status - show nothing */}
          {isFutureGig && !displayStatus ? null : statusConfig ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    className={cn(
                      "text-[10px] px-2.5 py-0.5 rounded-full font-medium border cursor-pointer hover:opacity-80 transition-opacity",
                      statusConfig.bgClass,
                      statusConfig.textClass,
                      statusConfig.borderClass
                    )}
                  >
                    {statusConfig.label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="p-1.5 min-w-[120px]"
                sideOffset={4}
                avoidCollisions={true}
              >
                {(["נשלחה", "שולם"] as IncomeStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(entry.id, status)}
                      className="p-1 focus:bg-transparent"
                    >
                      <Badge
                        className={cn(
                          "w-full justify-center text-[10px] px-2.5 py-1 rounded-full font-medium border cursor-pointer",
                          config.bgClass,
                          config.textClass,
                          config.borderClass
                        )}
                      >
                        {config.label}
                      </Badge>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Days since invoice badge */}
          {daysSinceInvoice !== null && displayStatus === "נשלחה" && (
            <Badge
              className={cn(
                "text-[9px] px-1.5 py-0 font-medium border-0",
                overdue
                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {daysSinceInvoice}
              <Clock className="h-2.5 w-2.5 mr-1" />
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 print:hidden">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {displayStatus === "בוצע" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onClick={(e) => {
                e.stopPropagation();
                onMarkInvoiceSent(entry.id);
              }}
              title="שלחתי חשבונית"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          )}
          {displayStatus === "נשלחה" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPaid(entry.id);
              }}
              title="סמן כשולם"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(entry);
            }}
            title="ערוך"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(entry);
            }}
            title="שכפל"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            title="מחק"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

