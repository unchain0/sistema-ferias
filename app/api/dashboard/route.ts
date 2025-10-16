import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getProfessionals, getVacationPeriods } from '@/lib/db';
import { DashboardData } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const professionals = await getProfessionals(session.user.id);
    const vacations = await getVacationPeriods(session.user.id);

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
