'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

interface CalendarDateRangePickerProps {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione um período',
}: CalendarDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onChange(range);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const buttonText = React.useMemo(() => {
    if (!value?.from) return placeholder;
    if (!value.to) return format(value.from, "dd 'de' MMM, yyyy", { locale: ptBR });
    return `${format(value.from, 'dd MMM', { locale: ptBR })} - ${format(value.to, 'dd MMM, yyyy', { locale: ptBR })}`;
  }, [value, placeholder]);

  const hasValue = value?.from || value?.to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full sm:w-[300px] justify-start text-left font-normal',
            !hasValue && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" suppressHydrationWarning />
          <span className="flex-1 truncate">{buttonText}</span>
          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="ml-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
            >
              <X className="h-3 w-3 opacity-60" suppressHydrationWarning />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-xl shadow-2xl border-neutral-800 bg-neutral-950 overflow-hidden"
        align="start"
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={handleCalendarSelect}
          numberOfMonths={2}
          className="rounded-lg border border-neutral-800 shadow-sm bg-neutral-950"
        />
      </PopoverContent>
    </Popover>
  );
}
