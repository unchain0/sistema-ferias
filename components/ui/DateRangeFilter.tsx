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
import { CalendarIcon } from 'lucide-react';
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
}

export function DateRangeFilter({
  className,
  startDate,
  endDate,
  onFilterChange,
}: DateRangeFilterProps) {
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

  // Sync internal state if props change externally (optional, but good for consistency)
  React.useEffect(() => {
    if (startDate && endDate) {
      // Only update if different to avoid loop if parent updates from child event
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
    }
  }, [startDate, endDate, date?.from, date?.to]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from && newDate?.to) {
      onFilterChange({
        startDate: format(newDate.from, 'yyyy-MM-dd'),
        endDate: format(newDate.to, 'yyyy-MM-dd'),
      });
    } else if (!newDate) {
      // Optional: Handle clearing
      // onFilterChange(null)
    }
  };

  const applyPreset = (getRange: () => { from: Date; to: Date }) => {
    const range = getRange();
    setDate(range);
    onFilterChange({
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
    });
  };

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

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[300px]',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{' '}
                  {format(date.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col space-y-2 p-2 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal text-xs"
                  onClick={() => applyPreset(preset.getValue)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
