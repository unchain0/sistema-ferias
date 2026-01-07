'use client';

import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker, type DropdownProps } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Habilita dropdowns para navegação rápida de mês/ano
   * @default true
   */
  showDropdowns?: boolean;
};

// Range de anos para o dropdown (10 anos para trás, 5 para frente)
const currentYear = new Date().getFullYear();
const START_MONTH = new Date(currentYear - 10, 0);
const END_MONTH = new Date(currentYear + 5, 11);

// Componente customizado para os dropdowns de mês/ano
function CustomDropdown(props: DropdownProps) {
  const { options, value, onChange, 'aria-label': ariaLabel } = props;

  const selectClassName = cn(
    'appearance-none bg-transparent cursor-pointer',
    'text-sm font-semibold text-gray-900 dark:text-gray-100',
    'hover:text-blue-600 dark:hover:text-blue-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded',
    'transition-colors px-1 py-0.5',
  );

  return (
    <select
      value={value?.toString()}
      onChange={onChange}
      className={selectClassName}
      aria-label={ariaLabel}
    >
      {options?.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="bg-white dark:bg-gray-900"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showDropdowns = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      locale={ptBR}
      // Navegação com dropdowns para mês e ano
      captionLayout={showDropdowns ? 'dropdown' : 'label'}
      // Esconde as setas de navegação quando usar dropdowns
      hideNavigation={showDropdowns}
      startMonth={START_MONTH}
      endMonth={END_MONTH}
      classNames={{
        // Layout
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 items-center h-10',
        caption_label: 'text-sm font-semibold text-gray-900 dark:text-gray-100',

        // Dropdowns container
        dropdowns: 'flex items-center gap-1',

        // Navigation (visível apenas quando showDropdowns=false)
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 text-gray-600 dark:text-gray-400',
          'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
          'border-gray-200 dark:border-gray-700',
          'transition-colors',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 text-gray-600 dark:text-gray-400',
          'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
          'border-gray-200 dark:border-gray-700',
          'transition-colors',
        ),

        // Table structure
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'text-gray-500 dark:text-gray-400 rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wide',
        week: 'flex w-full mt-1',

        // Day cells
        day: cn(
          'relative h-10 w-10 p-0 text-center text-sm font-normal',
          'focus-within:relative focus-within:z-20',
          // Range middle background
          '[&:has([aria-selected])]:bg-blue-50 dark:[&:has([aria-selected])]:bg-blue-950/30',
          // First day of range
          '[&:has([aria-selected].day-range-start)]:rounded-l-lg',
          // Last day of range
          '[&:has([aria-selected].day-range-end)]:rounded-r-lg',
          // Outside days in range
          '[&:has([aria-selected].day-outside)]:bg-blue-50/50 dark:[&:has([aria-selected].day-outside)]:bg-blue-950/20',
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-normal rounded-lg',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:bg-gray-100 dark:focus:bg-gray-800',
          'transition-colors',
          'aria-selected:opacity-100',
        ),

        // Range states
        range_start:
          'day-range-start rounded-lg !bg-blue-600 !text-white hover:!bg-blue-700 focus:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600',
        range_end:
          'day-range-end rounded-lg !bg-blue-600 !text-white hover:!bg-blue-700 focus:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600',
        range_middle:
          'rounded-none !bg-transparent text-blue-700 dark:text-blue-300 hover:!bg-blue-100 dark:hover:!bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-200',

        // Selected (single mode)
        selected:
          'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg',

        // Today indicator
        today:
          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg',

        // Outside days (other months)
        outside: 'day-outside text-gray-400 dark:text-gray-600 opacity-50',

        // Disabled days
        disabled: 'text-gray-300 dark:text-gray-700 opacity-50 cursor-not-allowed',

        // Hidden days
        hidden: 'invisible',

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...chevronProps} />;
        },
        Dropdown: CustomDropdown,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
