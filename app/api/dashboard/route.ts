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

    // Group by month
    const vacationsByMonth = vacations.reduce((acc, vacation) => {
      const month = format(parseISO(vacation.usageStartDate), 'MMM yyyy', { locale: ptBR });
      
      if (!acc[month]) {
        acc[month] = { month, count: 0, impact: 0 };
      }
      
      acc[month].count += vacation.totalDays;
      acc[month].impact += vacation.revenueDeduction;
      
      return acc;
    }, {} as Record<string, { month: string; count: number; impact: number }>);

    // Professional impacts
    const professionalImpacts = professionals.map(prof => {
      const profVacations = vacations.filter(v => v.professionalId === prof.id);
      const totalDays = profVacations.reduce((sum, v) => sum + v.totalDays, 0);
      const revenueImpact = profVacations.reduce((sum, v) => sum + v.revenueDeduction, 0);
      
      return {
        professionalName: prof.name,
        totalDays,
        revenueImpact,
      };
    }).filter(p => p.totalDays > 0);

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
