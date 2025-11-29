"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IncomeEntry, IncomeStatus, STATUS_CONFIG } from "../types";
import { getDisplayStatus } from "../utils";
import { IncomeDetailView } from "./income-drawer/IncomeDetailView";
import { IncomeDetailEdit } from "./income-drawer/IncomeDetailEdit";

interface IncomeDetailDrawerProps {
  entry: IncomeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid: (id: number | string) => void;
  onMarkInvoiceSent: (id: number | string) => void;
  onUpdate: (entry: IncomeEntry) => void;
  onStatusChange: (id: number | string, status: IncomeStatus) => void;
}

export function IncomeDetailDrawer({
  entry,
  isOpen,
  onClose,
  onMarkAsPaid,
  onMarkInvoiceSent,
  onUpdate,
  onStatusChange,
}: IncomeDetailDrawerProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setIsEditing(false);
  }, [entry, isOpen]);

  if (!entry) return null;

  const displayStatus = getDisplayStatus(entry);
  const statusConfig = displayStatus ? STATUS_CONFIG[displayStatus] : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        dir="rtl"
      >
        <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              פרטי עבודה
            </SheetTitle>
            {statusConfig && (
              <Badge
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium border",
                  statusConfig.bgClass,
                  statusConfig.textClass,
                  statusConfig.borderClass
                )}
              >
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {isEditing ? (
          <IncomeDetailEdit
            entry={entry}
            onSave={(updatedEntry) => {
              onUpdate(updatedEntry);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            onStatusChange={onStatusChange}
          />
        ) : (
          <IncomeDetailView
            entry={entry}
            onEdit={() => setIsEditing(true)}
            onClose={onClose}
            onMarkAsPaid={onMarkAsPaid}
            onMarkInvoiceSent={onMarkInvoiceSent}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
