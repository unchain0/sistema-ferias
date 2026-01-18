'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import {
  DayPicker,
  type DropdownProps,
  getDefaultClassNames,
  useNavigation,
} from 'react-day-picker';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Habilita dropdowns para navegação rápida de mês/ano
   * @default false para range mode (usa botões), true para single mode (usa dropdowns)
   */
  showDropdowns?: boolean;
};

const currentYear = new Date().getFullYear();
const START_MONTH = new Date(currentYear - 100, 0);
const END_MONTH = new Date(currentYear + 100, 11);

function CustomMonthCaption(props: {
  displayIndex: number;
  calendarMonth: { date: Date };
  children?: React.ReactNode;
}) {
  const { displayIndex, calendarMonth } = props;
  const { goToMonth, previousMonth, nextMonth } = useNavigation();

  const monthName = React.useMemo(() => {
    return format(calendarMonth.date, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c: string) =>
      c.toUpperCase(),
    );
  }, [calendarMonth.date]);

  return (
    <div className="flex items-center justify-center h-10 gap-2 relative w-full px-8">
      <Button
        variant="outline"
        className={cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all border-neutral-800 absolute left-0',
          !previousMonth && 'opacity-20 pointer-events-none',
        )}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        type="button"
      >
        <ChevronLeft className="h-4 w-4 text-neutral-400" />
      </Button>

      <div className="text-sm font-bold text-neutral-100 min-w-[140px] text-center mx-auto">
        {monthName}
      </div>

      <Button
        variant="outline"
        className={cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all border-neutral-800 absolute right-0',
          !nextMonth && 'opacity-20 pointer-events-none',
        )}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        type="button"
      >
        <ChevronRight className="h-4 w-4 text-neutral-400" />
      </Button>
    </div>
  );
}

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
  showDropdowns,
  ...props
}: CalendarProps) {
  const mode = 'mode' in props ? props.mode : undefined;
  // Agora respeitamos captionLayout="dropdown" se passado via props
  const useDropdowns =
    props.captionLayout?.startsWith('dropdown') ?? showDropdowns ?? mode !== 'range';
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      locale={ptBR}
      startMonth={START_MONTH}
      endMonth={END_MONTH}
      captionLayout={useDropdowns ? 'dropdown' : 'label'}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...chevronProps} suppressHydrationWarning />;
        },
        Dropdown: CustomDropdown,
        MonthCaption: !useDropdowns ? CustomMonthCaption : undefined,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
