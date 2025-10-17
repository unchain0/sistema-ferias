import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getProfessionals, getVacationPeriods } from '@/lib/db-switch';
import { DashboardData } from '@/types';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const professionals = await getProfessionals(session.user.id);
    let vacations = await getVacationPeriods(session.user.id);

    // Filter vacations by date range if provided
    if (startDate && endDate) {
      const filterStart = parseISO(startDate);
      const filterEnd = parseISO(endDate);

      vacations = vacations.filter(vacation => {
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

    const totalProfessionals = professionals.length;
    const totalVacationDays = vacations.reduce((sum, v) => sum + v.totalDays, 0);
    const totalRevenueImpact = vacations.reduce((sum, v) => sum + v.revenueDeduction, 0);

    const monthMap = new Map<string, { monthKey: string; count: number; impact: number }>();
    for (const v of vacations) {
      const key = v.usageStartDate.slice(0, 7); // YYYY-MM
      const entry = monthMap.get(key) || { monthKey: key, count: 0, impact: 0 };
      entry.count += v.totalDays;
      entry.impact += v.revenueDeduction;
      monthMap.set(key, entry);
    }
    const vacationsByMonth = Array.from(monthMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(({ monthKey, count, impact }) => ({
        month: format(parseISO(`${monthKey}-01`), 'MMM yyyy', { locale: ptBR }),
        count,
        impact,
      }));

    const profAgg = new Map<string, { totalDays: number; revenueImpact: number }>();
    for (const v of vacations) {
      const cur = profAgg.get(v.professionalId) || { totalDays: 0, revenueImpact: 0 };
      cur.totalDays += v.totalDays;
      cur.revenueImpact += v.revenueDeduction;
      profAgg.set(v.professionalId, cur);
    }
    const nameById = new Map(professionals.map(p => [p.id, p.name] as const));
    const professionalImpacts = Array.from(profAgg.entries())
      .map(([id, agg]) => ({ professionalName: nameById.get(id) || 'Desconhecido', ...agg }))
      .filter(p => p.totalDays > 0);

    const dashboardData: DashboardData = {
      totalProfessionals,
      totalVacationDays,
      totalRevenueImpact,
      vacationsByMonth: Object.values(vacationsByMonth),
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
