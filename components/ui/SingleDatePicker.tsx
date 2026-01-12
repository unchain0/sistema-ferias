'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

interface SingleDatePickerProps {
  className?: string;
  date?: Date | null;
  onDateChange: (date: Date | null | undefined) => void;
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
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate || null);
    // Fecha o popover quando uma data é selecionada
    if (selectedDate) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
            </span>
            {date && !disabled && (
              <X
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            showDropdowns={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
