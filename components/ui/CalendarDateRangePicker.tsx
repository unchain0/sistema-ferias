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
import { CalendarIcon } from 'lucide-react';
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
}

const presets = [
  { label: 'Últimos 7 dias', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Últimos 30 dias', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
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
}: CalendarDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    onChange(preset.getValue());
    setOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onChange(range);
    if (range?.from && range?.to) {
      setTimeout(() => setOpen(false), 150);
    }
  };

  const buttonText = React.useMemo(() => {
    if (!value?.from) return 'Selecione um período';
    if (!value.to) return format(value.from, "dd 'de' MMM, yyyy", { locale: ptBR });
    return `${format(value.from, 'dd MMM', { locale: ptBR })} - ${format(value.to, 'dd MMM, yyyy', { locale: ptBR })}`;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full sm:w-[300px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              Atalhos
            </p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="relative p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              locale={ptBR}
              defaultMonth={value?.from || new Date()}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
