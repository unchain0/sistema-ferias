import { addDays, differenceInDays, format, isValid, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { IProfessionalRepository, IVacationRepository } from '@/interfaces/repositories';
import { computeConcessivePeriod } from '@/lib/utils';
import { Alert, DashboardData } from '@/types';

export class DashboardService {
  constructor(
    private professionalRepo: IProfessionalRepository,
    private vacationRepo: IVacationRepository,
  ) {}

  async getDashboardData(
    userId: string,
    startDate?: string | null,
    endDate?: string | null,
  ): Promise<DashboardData> {
    const { data: professionals } = await this.professionalRepo.getProfessionalsPaginated(userId);
    const { data: allVacations } = await this.vacationRepo.getVacationPeriodsPaginated(userId);
    let vacations = [...allVacations];

    if (startDate && endDate) {
      const parsedStart = parseISO(startDate);
      const parsedEnd = parseISO(endDate);

      if (isValid(parsedStart) && isValid(parsedEnd)) {
        const filterStart = startOfDay(parsedStart);
        const filterEndExclusive = addDays(startOfDay(parsedEnd), 1);

        vacations = vacations.filter((vacation) => {
          const vacationStart = startOfDay(parseISO(vacation.usageStartDate));
          const vacationEndExclusive = addDays(startOfDay(parseISO(vacation.usageEndDate)), 1);
          return vacationStart < filterEndExclusive && vacationEndExclusive > filterStart;
        });
      }
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
    const nameById = new Map(professionals.map((p) => [p.id, p.name] as const));
    const professionalImpacts = Array.from(profAgg.entries())
      .map(([id, agg]) => ({ professionalName: nameById.get(id) || 'Desconhecido', ...agg }))
      .filter((p) => p.totalDays > 0);

    // Alerts logic
    const alerts: Alert[] = [];
    const today = new Date();

    for (const v of allVacations) {
      const profName = nameById.get(v.professionalId) || 'Desconhecido';
      const usageStart = parseISO(v.usageStartDate);

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

      if (v.acquisitionStartDate && v.acquisitionEndDate) {
        const concessive = computeConcessivePeriod(v.acquisitionStartDate, v.acquisitionEndDate);
        const concessiveEnd = parseISO(concessive.end);
        const usageEnd = parseISO(v.usageEndDate);
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

    alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      totalProfessionals,
      totalVacationDays,
      totalRevenueImpact,
      vacationsByMonth,
      professionalImpacts,
      alerts: alerts.slice(0, 10),
    };
  }
}
