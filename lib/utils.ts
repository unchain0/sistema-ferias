import { differenceInDays, format, parseISO } from 'date-fns';
import { dateFnsLocale } from '@/lib/i18n';

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

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: dateFnsLocale });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
