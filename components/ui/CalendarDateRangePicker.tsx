'use client';

import {
  endOfMonth,
  endOfYear,
  format,
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

interface CalendarDateRangePickerProps {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

const presets = [
  { label: 'Últimos 7 dias', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  {
    label: 'Últimos 30 dias',
    getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: 'Este mês',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Últimos 3 meses',
    getValue: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Este ano',
    getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
  {
    label: 'Último ano',
    getValue: () => ({ from: subDays(new Date(), 365), to: new Date() }),
  },
];

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione um período',
}: CalendarDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    onChange(preset.getValue());
    setOpen(false);
  };

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
              className="ml-2 hover:bg-neutral-800 rounded-full p-0.5 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-400"
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
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col gap-1.5 p-4 border-b sm:border-b-0 sm:border-r border-neutral-800 bg-neutral-900/50 min-w-[160px]">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 px-1">
              Atalhos
            </p>
            <div className="flex flex-col gap-1">
              {presets.map((preset) => {
                const isSelected =
                  value?.from?.toDateString() === preset.getValue().from.toDateString() &&
                  value?.to?.toDateString() === preset.getValue().to.toDateString();

                return (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'justify-start text-xs h-8 px-2 rounded-md transition-all font-medium',
                      isSelected
                        ? 'bg-blue-900/40 text-blue-300 shadow-sm'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
                    )}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className="bg-transparent"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
