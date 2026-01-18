'use client';

import { format, isValid, parse } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Input } from '@/components/ui/Input';
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
  placeholder = 'dd/mm/aaaa',
  disabled = false,
}: SingleDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, 'dd/MM/yyyy'));
    } else {
      setInputValue('');
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length === 10) {
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        onDateChange(parsedDate);
      }
    }
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate || null);
    if (selectedDate) {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onDateChange(null);
  };

  return (
    <div className={cn('relative flex gap-2 w-full', className)}>
      <Input
        value={inputValue}
        placeholder={placeholder}
        className="bg-neutral-950 border-neutral-800 pr-10 focus-visible:ring-neutral-700"
        onChange={handleInputChange}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            disabled={disabled}
          >
            {date ? (
              <X
                className="size-4 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            ) : (
              <CalendarIcon className="size-4" />
            )}
            <span className="sr-only">Selecionar data</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-neutral-800 bg-neutral-950 shadow-2xl rounded-xl overflow-hidden"
          align="end"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            showDropdowns={true}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
