import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getProfessionals, getVacationPeriods } from '@/lib/db';
import { DashboardData, Alert } from '@/types';
import { format, parseISO, isWithinInterval, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { computeConcessivePeriod } from '@/lib/utils';

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
    const allVacations = await getVacationPeriods(session.user.id);
    let vacations = [...allVacations];

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

    // --- ALERTS LOGIC ---
    const alerts: Alert[] = [];
    const today = new Date();
    
    // We check ALL vacations for alerts, not just the filtered ones
    for (const v of allVacations) {
        const profName = nameById.get(v.professionalId) || 'Desconhecido';
        const usageStart = parseISO(v.usageStartDate);
        
        // 1. Upcoming Vacations (Next 30 days)
        const daysToStart = differenceInDays(usageStart, today);
        if (daysToStart >= 0 && daysToStart <= 30) {
            alerts.push({
                id: `upcoming-${v.id}`,
                type: 'upcoming_vacation',
                professionalName: profName,
                date: v.usageStartDate,
                daysRemaining: daysToStart,
                details: `Inicia em ${daysToStart === 0 ? 'hoje' : daysToStart + ' dias'}`,
            });
        }

        // 2. Concessive Limit Risk
        // If the vacation usage is dangerously close to the concessive period end
        if (v.acquisitionStartDate && v.acquisitionEndDate) {
            const concessive = computeConcessivePeriod(v.acquisitionStartDate, v.acquisitionEndDate);
            const concessiveEnd = parseISO(concessive.end);
            const usageEnd = parseISO(v.usageEndDate);
            
            // Check if usage extends beyond or is close to concessive end
            // Note: In Brazil, vacation MUST be taken entirely within the concessive period
            const daysUntilLimit = differenceInDays(concessiveEnd, usageEnd);
            
            if (daysUntilLimit < 0) {
                 alerts.push({
                    id: `expired-${v.id}`,
                    type: 'expiring_period',
                    professionalName: profName,
                    date: concessive.end,
                    daysRemaining: daysUntilLimit,
                    details: `Ultrapassou limite concessivo (${format(concessiveEnd, 'dd/MM/yyyy')})`,
                });
            } else if (daysUntilLimit <= 30) {
                alerts.push({
                    id: `risk-${v.id}`,
                    type: 'expiring_period',
                    professionalName: profName,
                    date: concessive.end,
                    daysRemaining: daysUntilLimit,
                    details: `Perto do limite concessivo (${format(concessiveEnd, 'dd/MM/yyyy')})`,
                });
            }
        }
    }
    
    // Sort alerts by urgency (days remaining)
    alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const dashboardData: DashboardData = {
      totalProfessionals,
      totalVacationDays,
      totalRevenueImpact,
      vacationsByMonth: Object.values(vacationsByMonth),
      professionalImpacts,
      alerts: alerts.slice(0, 10), // Top 10 alerts
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
