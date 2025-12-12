'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';

interface SingleDatePickerProps {
  className?: string;
  date?: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SingleDatePicker({
  className,
  date,
  onDateChange,
  placeholder = 'Selecione uma data',
  disabled = false,
}: SingleDatePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, 'dd/MM/yyyy', { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            locale={ptBR}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}