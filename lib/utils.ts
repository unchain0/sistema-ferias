import { differenceInDays, format, parseISO, addYears, addDays } from 'date-fns';

export function calculateVacationDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return differenceInDays(end, start) + 1; // +1 to include both start and end dates
}

export function calculateRevenueDeduction(
  monthlyRevenue: number,
  vacationDays: number
): number {
  // Assuming 30 days per month for proportional calculation
  const dailyRate = monthlyRevenue / 30;
  return dailyRate * vacationDays;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateToPtBR(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if date is invalid
  }
  return date.toLocaleDateString('pt-BR');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Given acquisition period, compute concessivo period (período concessivo - the 12-month period 
// after acquisition when vacation can be taken, as defined in Brazilian labor law)
export function computeConcessivePeriod(
  acquisitionStartDate: string,
  acquisitionEndDate: string
): { start: string; end: string } {
  const endParsed = parseISO(acquisitionEndDate);
  const concessiveStart = addDays(endParsed, 1);
  const concessiveEnd = addDays(addYears(concessiveStart, 1), -1);
  return {
    start: format(concessiveStart, 'yyyy-MM-dd'),
    end: format(concessiveEnd, 'yyyy-MM-dd'),
  };
}
