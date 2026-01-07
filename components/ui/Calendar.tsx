'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        // Layout
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 items-center h-10',
        caption_label: 'text-sm font-semibold text-gray-900 dark:text-gray-100',

        // Navigation - positioned at edges of calendar container
        nav: 'absolute top-4 inset-x-3 flex items-center justify-between pointer-events-none z-10',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 text-gray-600 dark:text-gray-400 pointer-events-auto',
          'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
          'border-gray-200 dark:border-gray-700',
          'transition-colors',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 text-gray-600 dark:text-gray-400 pointer-events-auto',
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
        Chevron: ({ orientation, ...props }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...props} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
