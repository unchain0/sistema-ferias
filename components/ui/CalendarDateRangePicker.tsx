"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, subDays, startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

interface CalendarDateRangePickerProps {
  className?: string
  startDate?: string
  endDate?: string
  onDateChange: (range: { startDate: string; endDate: string } | null) => void
}

export function CalendarDateRangePicker({
  className,
  startDate,
  endDate,
  onDateChange,
}: CalendarDateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: parseISO(startDate),
        to: parseISO(endDate)
      }
    }
    return {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  })

  // Sync internal state if props change externally
  React.useEffect(() => {
    if (startDate && endDate) {
        if (date?.from && format(date.from, 'yyyy-MM-dd') === startDate && 
            date?.to && format(date.to, 'yyyy-MM-dd') === endDate) {
            return
        }
        setDate({
            from: parseISO(startDate),
            to: parseISO(endDate)
        })
    }
  }, [startDate, endDate, date?.from, date?.to])

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    
    if (newDate?.from && newDate?.to) {
      onDateChange({
        startDate: format(newDate.from, "yyyy-MM-dd"),
        endDate: format(newDate.to, "yyyy-MM-dd"),
      })
    }
  }

  const presets = [
    {
      label: "Hoje",
      getValue: () => ({ from: new Date(), to: new Date() }),
    },
    {
      label: "Ontem",
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday }
      },
    },
    {
      label: "Últimos 7 dias",
      getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
      label: "Últimos 30 dias",
      getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
    },
    {
      label: "Este Mês",
      getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    },
     {
      label: "Últimos 3 Meses",
      getValue: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) }),
    },
    {
      label: "Este ano",
      getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
    },
    {
      label: "Ano passado",
      getValue: () => {
         const lastYear = subDays(startOfYear(new Date()), 1);
         return { from: startOfYear(lastYear), to: endOfYear(lastYear) }
      },
    },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[300px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
             {/* Presets Sidebar */}
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
                    onClick={() => {
                        const range = preset.getValue()
                        handleSelect(range)
                    }}
                 >
                   {preset.label}
                 </Button>
               ))}
             </div>

             {/* Calendar */}
             <div className="p-2">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.to}
                    selected={date}
                    onSelect={handleSelect}
                    numberOfMonths={1}
                    locale={ptBR}
                    className="p-3"
                />
             </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
