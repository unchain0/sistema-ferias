'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import {
  DayPicker,
  type DropdownProps,
  getDefaultClassNames,
  type MonthCaptionProps,
  useDayPicker,
  useNavigation,
} from 'react-day-picker';

import { Button, buttonVariants } from '@/components/ui/Button';
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

function CustomMonthCaption(props: MonthCaptionProps) {
  const { displayIndex, calendarMonth } = props;
  const { goToMonth, previousMonth, nextMonth } = useNavigation();
  const dayPicker = useDayPicker();
  const numberOfMonths =
    (dayPicker as unknown as { props: { numberOfMonths?: number } }).props?.numberOfMonths || 1;

  const monthName = React.useMemo(() => {
    return format(calendarMonth.date, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c: string) =>
      c.toUpperCase(),
    );
  }, [calendarMonth.date]);

  const isFirst = displayIndex === 0;
  const isLast = displayIndex === numberOfMonths - 1;

  return (
    <div className="flex items-center justify-center h-10 gap-1 w-full">
      <div className="w-8 flex justify-center">
        {isFirst && (
          <Button
            variant="outline"
            className={cn(
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all border-neutral-800',
              !previousMonth && 'opacity-20 pointer-events-none',
            )}
            onClick={() => previousMonth && goToMonth(previousMonth)}
            disabled={!previousMonth}
            type="button"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-400" />
          </Button>
        )}
      </div>

      <div className="text-sm font-bold text-neutral-100 min-w-[140px] text-center">
        {monthName}
      </div>

      <div className="w-8 flex justify-center">
        {isLast && (
          <Button
            variant="outline"
            className={cn(
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all border-neutral-800',
              !nextMonth && 'opacity-20 pointer-events-none',
            )}
            onClick={() => nextMonth && goToMonth(nextMonth)}
            disabled={!nextMonth}
            type="button"
          >
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </Button>
        )}
      </div>
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
  // Por padrão: dropdowns para single mode, botões de navegação para range mode
  const mode = 'mode' in props ? props.mode : undefined;
  const useDropdowns = showDropdowns ?? mode !== 'range';
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      locale={ptBR}
      // 'dropdown' mostra dropdowns de mês/ano, 'label' mostra texto com botões de navegação
      captionLayout={useDropdowns ? 'dropdown' : 'label'}
      startMonth={START_MONTH}
      endMonth={END_MONTH}
      classNames={{
        // Layout principal
        months: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
        month: 'space-y-4',

        // Caption (cabeçalho do mês)
        month_caption: 'flex justify-center relative items-center h-10 w-full',
        caption_label: 'text-sm font-semibold text-gray-100',

        // Container dos dropdowns
        dropdowns: 'flex items-center gap-2',

        nav: 'hidden',

        // Ícone do chevron
        chevron: `${defaultClassNames.chevron} fill-gray-400`,

        // Estrutura da tabela
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'text-gray-500 dark:text-gray-400 rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wide',
        week: 'flex w-full mt-1',

        // Célula do dia - container
        day: cn(
          'relative h-10 w-10 p-0 text-center text-sm font-normal',
          'focus-within:relative focus-within:z-20',
        ),

        // Botão do dia - elemento clicável
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-normal rounded-md',
          'hover:bg-gray-100 dark:hover:bg-zinc-800',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'transition-colors',
          'aria-selected:opacity-100',
        ),

        // Estados de range - aplicados ao day_button
        range_start: cn(
          '!bg-blue-600 !text-white !rounded-l-md !rounded-r-none',
          'hover:!bg-blue-700 focus:!bg-blue-700',
          'dark:!bg-blue-500 dark:hover:!bg-blue-600',
        ),
        range_end: cn(
          '!bg-blue-600 !text-white !rounded-r-md !rounded-l-none',
          'hover:!bg-blue-700 focus:!bg-blue-700',
          'dark:!bg-blue-500 dark:hover:!bg-blue-600',
        ),
        range_middle: cn(
          '!bg-blue-100 dark:!bg-blue-900/50 !text-blue-900 dark:!text-blue-100',
          '!rounded-none',
          'hover:!bg-blue-200 dark:hover:!bg-blue-800/60',
        ),

        // Selecionado (single mode)
        selected: cn(
          '!bg-blue-600 !text-white !rounded-md',
          'hover:!bg-blue-700 focus:!bg-blue-700',
          'dark:!bg-blue-500 dark:hover:!bg-blue-600',
        ),

        // Indicador de hoje
        today: cn(
          'bg-gray-100 dark:bg-zinc-800',
          'text-gray-900 dark:text-white font-semibold',
          'rounded-md',
        ),

        // Dias de outros meses
        outside: cn('text-gray-400 dark:text-gray-600', 'opacity-50 aria-selected:opacity-40'),

        // Dias desabilitados
        disabled: 'text-gray-300 dark:text-gray-700 opacity-50 cursor-not-allowed',

        // Dias ocultos
        hidden: 'invisible',

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...chevronProps} suppressHydrationWarning />;
        },
        Dropdown: CustomDropdown,
        MonthCaption: CustomMonthCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
