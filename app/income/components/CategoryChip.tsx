"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  SlidersHorizontal,
  Mic2,
  BookOpen,
  Layers,
  Circle,
} from "lucide-react";
import type { Category } from "../types";

// Visual mapping for income categories used across table, filters, and dialogs
const CATEGORY_META: Record<
  Category | "אולפן" | "default",
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  הופעות: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-100 dark:border-emerald-800",
    icon: Sparkles,
  },
  הפקה: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-100 dark:border-indigo-800",
    icon: SlidersHorizontal,
  },
  הקלטות: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-100 dark:border-sky-800",
    icon: Mic2,
  },
  הוראה: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-100 dark:border-amber-800",
    icon: BookOpen,
  },
  עיבודים: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-100 dark:border-purple-800",
    icon: Layers,
  },
  אחר: {
    bg: "bg-slate-50 dark:bg-slate-800/40",
    text: "text-slate-700 dark:text-slate-200",
    border: "border-slate-200 dark:border-slate-700",
    icon: Circle,
  },
  // Some users use "אולפן" even if not in the core list
  אולפן: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-100 dark:border-blue-800",
    icon: SlidersHorizontal,
  },
  default: {
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-600 dark:text-slate-200",
    border: "border-slate-200 dark:border-slate-700",
    icon: Circle,
  },
};

interface CategoryChipProps {
  category?: string | null;
  size?: "sm" | "md";
  withIcon?: boolean;
  className?: string;
}

export function CategoryChip({
  category,
  size = "md",
  withIcon = true,
  className,
}: CategoryChipProps) {
  const meta =
    (category && CATEGORY_META[category as Category]) ||
    CATEGORY_META.default;
  const Icon = meta.icon;

  const padding = size === "sm" ? "text-[11px]" : "text-xs";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const showIcon = withIcon && Boolean(category);
  const textClass = category ? meta.text : "text-slate-400 dark:text-slate-500";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium whitespace-nowrap",
        textClass,
        padding,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSize, "shrink-0 opacity-80")} />
      )}
      <span className="truncate max-w-[120px]">
        {category || "ללא קטגוריה"}
      </span>
    </span>
  );
}

export function getCategoryMeta(category?: string | null) {
  return (category && CATEGORY_META[category as Category]) || CATEGORY_META.default;
}

