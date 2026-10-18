import { format, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { getProfessionals, getVacationPeriods } from '@/lib/db-switch';
import type { DashboardData, Professional, VacationPeriod } from '@/types';

interface MonthAggregation {
  readonly monthKey: string;
  readonly count: number;
  readonly impact: number;
}

interface ProfessionalAggregation {
  readonly totalDays: number;
  readonly revenueImpact: number;
}

function filterVacationsByDateRange(
  vacations: readonly VacationPeriod[],
  startDate?: string | null,
  endDate?: string | null
): VacationPeriod[] {
  if (startDate === null || startDate === undefined || endDate === null || endDate === undefined) {
    return [...vacations];
  }
  const filterStart = parseISO(startDate);
  const filterEnd = parseISO(endDate);

  return vacations.filter((vacation) => {
    const vacationStart = parseISO(vacation.usageStartDate);
    const vacationEnd = parseISO(vacation.usageEndDate);

    // Include vacation if it overlaps with the filter range
    return (
      isWithinInterval(vacationStart, { start: filterStart, end: filterEnd }) ||
      isWithinInterval(vacationEnd, { start: filterStart, end: filterEnd }) ||
      (vacationStart <= filterStart && vacationEnd >= filterEnd)
    );
  });
}

function aggregateVacationsByMonth(
  vacations: readonly VacationPeriod[]
): Array<{ month: string; count: number; impact: number }> {
  const monthMap = new Map<string, MonthAggregation>();
  for (const v of vacations) {
    const key = v.usageStartDate.slice(0, 7); // YYYY-MM
    const existing = monthMap.get(key);
    const entry: MonthAggregation = existing
      ? { monthKey: key, count: existing.count + v.totalDays, impact: existing.impact + v.revenueDeduction }
      : { monthKey: key, count: v.totalDays, impact: v.revenueDeduction };
    monthMap.set(key, entry);
  }
  return [...monthMap.values()]
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map(({ monthKey, count, impact }) => ({
      month: format(parseISO(`${monthKey}-01`), 'MMM yyyy', { locale: ptBR }),
      count,
      impact,
    }));
}

function aggregateVacationsByProfessional(
  vacations: readonly VacationPeriod[],
  professionals: readonly Professional[]
): Array<{ professionalName: string; totalDays: number; revenueImpact: number }> {
  const profAgg = new Map<string, ProfessionalAggregation>();
  for (const v of vacations) {
    const existing = profAgg.get(v.professionalId);
    const current: ProfessionalAggregation = existing
      ? { totalDays: existing.totalDays + v.totalDays, revenueImpact: existing.revenueImpact + v.revenueDeduction }
      : { totalDays: v.totalDays, revenueImpact: v.revenueDeduction };
    profAgg.set(v.professionalId, current);
  }
  const nameById = new Map(professionals.map((p) => [p.id, p.name] as const));
  return [...profAgg.entries()]
    .map(([id, agg]) => ({ professionalName: nameById.get(id) ?? 'Desconhecido', ...agg }))
    .filter((p) => p.totalDays > 0);
}

export async function GET(request: Request): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const professionals = await getProfessionals(session.user.id);
    const allVacations = await getVacationPeriods(session.user.id);
    const vacations = filterVacationsByDateRange(allVacations, startDate, endDate);

    const totalProfessionals = professionals.length;
    const totalVacationDays = vacations.reduce((sum, v) => sum + v.totalDays, 0);
    const totalRevenueImpact = vacations.reduce((sum, v) => sum + v.revenueDeduction, 0);

    const vacationsByMonth = aggregateVacationsByMonth(vacations);
    const professionalImpacts = aggregateVacationsByProfessional(vacations, professionals);

    const dashboardData: DashboardData = {
      totalProfessionals,
      totalVacationDays,
      totalRevenueImpact,
      vacationsByMonth,
      professionalImpacts,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados do dashboard' },
      { status: 500 }
    );
  }
}