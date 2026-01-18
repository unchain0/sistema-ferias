import { Professional, User, VacationPeriod } from '@/types';

import { authService } from './di';

export async function createDemoData() {
  const demoUserId = 'demo-user-id';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Helper: ISO date without timezone surprises
  const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString();

  // Demo User (always “recent”)
  const demoUser: User = {
    id: demoUserId,
    email: 'demo@sistema-ferias.com',
    name: 'Usuário Demonstração',
    password: await authService.hashPassword('demo123'),
    createdAt: iso(currentYear - 1, 1, 10),
    updatedAt: iso(currentYear - 1, 1, 10),
  };

  // Demo Professionals (volume razoável e datas recentes)
  const baseProfessionals: Array<Omit<Professional, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> =
    [
      { name: 'João Silva', clientManager: 'Maria Santos', monthlyRevenue: 15000 },
      { name: 'Ana Costa', clientManager: 'Carlos Oliveira', monthlyRevenue: 18000 },
      { name: 'Pedro Almeida', clientManager: 'Juliana Ferreira', monthlyRevenue: 12000 },
      { name: 'Carla Mendes', clientManager: 'Roberto Lima', monthlyRevenue: 20000 },
      { name: 'Lucas Martins', clientManager: 'Fernanda Souza', monthlyRevenue: 16000 },
      { name: 'Beatriz Rodrigues', clientManager: 'André Silva', monthlyRevenue: 14000 },
      { name: 'Rafael Santos', clientManager: 'Paula Costa', monthlyRevenue: 17000 },
      { name: 'Mariana Oliveira', clientManager: 'Ricardo Mendes', monthlyRevenue: 19000 },
      { name: 'Thiago Souza', clientManager: 'Camila Rocha', monthlyRevenue: 15500 },
      { name: 'Patricia Lima', clientManager: 'Eduardo Santos', monthlyRevenue: 16500 },
      { name: 'Gabriel Ferreira', clientManager: 'Amanda Silva', monthlyRevenue: 13500 },
      { name: 'Juliana Matos', clientManager: 'Leonardo Costa', monthlyRevenue: 17500 },
      { name: 'Bruno Nogueira', clientManager: 'Isabela Lima', monthlyRevenue: 21000 },
      { name: 'Larissa Pires', clientManager: 'Vitor Alves', monthlyRevenue: 14500 },
      { name: 'Diego Rocha', clientManager: 'Aline Campos', monthlyRevenue: 18500 },
      { name: 'Renata Barbosa', clientManager: 'Fábio Santos', monthlyRevenue: 16000 },
      { name: 'Felipe Monteiro', clientManager: 'Carolina Souza', monthlyRevenue: 19500 },
      { name: 'Camila Azevedo', clientManager: 'Rafaela Duarte', monthlyRevenue: 15500 },
    ];

  const demoProfessionals: Professional[] = baseProfessionals.map((p, i) => {
    const createdMonth = ((currentMonth + i - 1) % 12) + 1;
    const createdYear = currentYear - (createdMonth > currentMonth ? 1 : 0);
    const createdDate = iso(createdYear, createdMonth, 5);

    return {
      id: `prof-${i + 1}`,
      userId: demoUserId,
      ...p,
      createdAt: createdDate,
      updatedAt: createdDate,
    };
  });

  // Demo Vacation Periods
  // Gera dados relativos ao ano atual, evitando ficar “antigo”.
  // Por padrão: 2 períodos por profissional nos últimos ~18 meses.
  const demoVacations: VacationPeriod[] = [];

  const profIds = demoProfessionals.map((p) => p.id);
  const revenueByProf = new Map(demoProfessionals.map((p) => [p.id, p.monthlyRevenue]));

  function pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  function daysInMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate();
  }

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(n, max));
  }

  function addMonths(y: number, m: number, delta: number) {
    const total = y * 12 + (m - 1) + delta;
    return { y: Math.floor(total / 12), m: (total % 12) + 1 };
  }

  function pushVacation(params: {
    usageYear: number;
    usageMonth: number;
    usageDay: number;
    durationDays: number;
    professionalIndex: number;
    seq: number;
    acquisitionYear: number;
  }) {
    const profId = profIds[params.professionalIndex % profIds.length];
    const monthDays = daysInMonth(params.usageYear, params.usageMonth);
    const usageDay = clamp(params.usageDay, 1, monthDays);
    const durationDays = clamp(params.durationDays, 1, monthDays - usageDay + 1);

    const start = `${params.usageYear}-${pad(params.usageMonth)}-${pad(usageDay)}`;
    const endDay = usageDay + durationDays - 1;
    const end = `${params.usageYear}-${pad(params.usageMonth)}-${pad(endDay)}`;

    const daily = (revenueByProf.get(profId) || 0) / 30;
    const revenueDeduction = parseFloat((daily * durationDays).toFixed(2));
    const createdDate = iso(params.usageYear, params.usageMonth, 1);

    demoVacations.push({
      id: `vac-${params.usageYear}-${pad(params.usageMonth)}-${params.seq}`,
      professionalId: profId,
      userId: demoUserId,
      acquisitionStartDate: `${params.acquisitionYear}-01-01`,
      acquisitionEndDate: `${params.acquisitionYear}-12-31`,
      usageStartDate: start,
      usageEndDate: end,
      totalDays: durationDays,
      revenueDeduction,
      createdAt: createdDate,
      updatedAt: createdDate,
    });
  }

  const lookbackMonths = 18;
  const periodsPerProfessional = 2;

  // Distribui férias ao longo dos últimos meses.
  // Ex.: profissional i -> meses (-(i%lookback), -(i%lookback)-6) para ter dispersão.
  let seq = 1;
  for (let i = 0; i < profIds.length; i++) {
    for (let p = 0; p < periodsPerProfessional; p++) {
      const monthOffset = -((i * 2 + p * 6) % lookbackMonths);
      const { y, m } = addMonths(currentYear, currentMonth, monthOffset);

      // Duracoes variadas e início em dias “seguros”
      const durationOptions = [5, 7, 10, 14, 15];
      const durationDays = durationOptions[(i + p) % durationOptions.length];
      const usageDay = 2 + ((i + p) % 20);

      const acquisitionYear = y - 1;
      pushVacation({
        usageYear: y,
        usageMonth: m,
        usageDay,
        durationDays,
        professionalIndex: i,
        seq,
        acquisitionYear,
      });
      seq++;
    }
  }

  return {
    user: demoUser,
    professionals: demoProfessionals,
    vacations: demoVacations,
  };
}
