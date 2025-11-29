"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, User, Download, Printer } from "lucide-react";
import { MONTH_NAMES } from "../utils";

interface IncomeHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
}

export function IncomeHeader({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  isDarkMode,
  onToggleDarkMode,
  onExportCSV,
  onPrint,
}: IncomeHeaderProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <header className="rounded-2xl bg-white/80 dark:bg-slate-900/80 px-4 py-3 shadow-sm backdrop-blur border border-slate-100 dark:border-slate-800 print:shadow-none print:border-slate-200">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🎹
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              מעקב הכנסות
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ניהול עבודות וחשבוניות
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 print:hidden">
          {/* Export/Print Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportCSV}
              className="h-9 px-3 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4 ml-1" />
              ייצוא
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrint}
              className="h-9 px-3 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer className="h-4 w-4 ml-1" />
              הדפס
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Month/Year Selectors */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => onMonthChange(parseInt(v))}
            >
              <SelectTrigger className="w-[120px] h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MONTH_NAMES).map(([value, name]) => (
                  <SelectItem key={value} value={value}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => onYearChange(parseInt(v))}
            >
              <SelectTrigger className="w-[90px] h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onToggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

