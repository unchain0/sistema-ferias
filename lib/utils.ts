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

/**
 * Converts date to format accepted by input type="date" (yyyy-MM-dd)
 * Accepts: Date object, ISO string, or dd/mm/yyyy string
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  // If it's a Date object
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's already in ISO format yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss
  if (typeof date === 'string' && date.includes('-')) {
    const dateOnly = date.split('T')[0]; // Remove time if exists
    // Validate it's a proper ISO date (yyyy-MM-dd)
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoPattern.test(dateOnly)) {
      return dateOnly;
    }
  }
  
  // If it comes in Brazilian format dd/mm/yyyy
  if (typeof date === 'string' && date.includes('/')) {
    const parts = date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Validate that we have reasonable values
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum > 1900) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  
  return '';
}

/**
 * Converts date from ISO format (yyyy-MM-dd) to Brazilian format (dd/mm/yyyy)
 */
export function convertISOToBR(isoDate: string): string {
  if (!isoDate) return '';
  
  // Handle ISO datetime format
  const dateOnly = isoDate.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  
  return '';
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
