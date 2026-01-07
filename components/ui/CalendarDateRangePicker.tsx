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
}

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
}: CalendarDateRangePickerProps) {
  const presets: Array<{ label: string; getValue: () => DateRange }> = [
    {
      label: 'Hoje',
      getValue: () => ({ from: new Date(), to: new Date() }),
    },
    {
      label: 'Ontem',
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      },
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
    {
      label: 'Ano passado',
      getValue: () => {
        const lastYear = subMonths(new Date(), 12);
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
      },
    },
  ];

  const label = value?.from
    ? value.to
      ? `${format(value.from, "dd 'de' MMM, yyyy", { locale: ptBR })} - ${format(value.to, "dd 'de' MMM, yyyy", { locale: ptBR })}`
      : format(value.from, "dd 'de' MMM, yyyy", { locale: ptBR })
    : 'Selecione um período';

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[300px]',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col space-y-1 p-3 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 sm:w-40">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                Períodos Rápidos
              </span>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal text-xs h-8"
                  onClick={() => onChange(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value?.to}
                selected={value}
                onSelect={onChange}
                numberOfMonths={1}
                locale={ptBR}
                className="p-3"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
