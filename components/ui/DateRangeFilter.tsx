'use client';

import {
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

export type { DateRange };

interface DateRangeFilterProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  onFilterChange: (range: { startDate: string; endDate: string } | null) => void;
  placeholder?: string;
}

const presets = [
  {
    label: 'Hoje',
    getValue: () => ({ from: new Date(), to: new Date() }),
  },
  {
    label: 'Últimos 7 dias',
    getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }),
  },
  {
    label: 'Últimos 30 dias',
    getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: 'Este Mês',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Últimos 3 Meses',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Este ano',
    getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
];

export function DateRangeFilter({
  className,
  startDate,
  endDate,
  onFilterChange,
  placeholder = 'Selecione um período',
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  // Initialize internal state from props if available
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: parseISO(startDate),
        to: parseISO(endDate),
      };
    }
    return undefined;
  });

  // Sync internal state if props change externally
  React.useEffect(() => {
    if (startDate && endDate) {
      if (
        date?.from &&
        format(date.from, 'yyyy-MM-dd') === startDate &&
        date?.to &&
        format(date.to, 'yyyy-MM-dd') === endDate
      ) {
        return;
      }
      setDate({
        from: parseISO(startDate),
        to: parseISO(endDate),
      });
    } else if (!startDate && !endDate && date) {
      setDate(undefined);
    }
  }, [startDate, endDate, date]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from && newDate?.to) {
      onFilterChange({
        startDate: format(newDate.from, 'yyyy-MM-dd'),
        endDate: format(newDate.to, 'yyyy-MM-dd'),
      });
      setTimeout(() => setOpen(false), 150);
    }
  };

  const applyPreset = (getRange: () => { from: Date; to: Date }) => {
    const range = getRange();
    setDate(range);
    onFilterChange({
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
    });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onFilterChange(null);
  };

  const hasValue = date?.from || date?.to;

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[300px]',
              !hasValue && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'dd MMM', { locale: ptBR })} -{' '}
                    {format(date.to, 'dd MMM, yyyy', { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })
                )
              ) : (
                placeholder
              )}
            </span>
            {hasValue && (
              <X
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            {/* Presets */}
            <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                Atalhos
              </p>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-8 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                  onClick={() => applyPreset(preset.getValue)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                showDropdowns={false}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
