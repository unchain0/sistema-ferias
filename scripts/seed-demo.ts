import { config as loadEnv } from 'dotenv';

// Load .env.local (and fallback .env) when running outside Next.js
loadEnv({ path: '.env.local', override: false });
loadEnv({ path: '.env', override: false });

const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
const missing = requiredEnvVars.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `Missing env var(s): ${missing.join(', ')}. Configure your .env.local (see .env.example) before running seed.`,
  );
  process.exit(1);
}

async function main() {
  const { createDemoData } = await import('@/lib/seed-demo');
  const {
    createProfessional,
    createUser,
    createVacationPeriod,
    deleteAllProfessionals,
    deleteAllVacationPeriods,
    getUserByEmail,
  } = await import('@/lib/db');

  const demoData = await createDemoData();

  let user = await getUserByEmail(demoData.user.email);
  if (!user) {
    user = await createUser({
      email: demoData.user.email,
      name: demoData.user.name,
      password: demoData.user.password,
    });
    console.log(`Created demo user: ${user.email}`);
  } else {
    await deleteAllVacationPeriods(user.id);
    await deleteAllProfessionals(user.id);
    console.log(`Reset demo data for user: ${user.email}`);
  }

  const profIdMap: Record<string, string> = {};
  for (const professional of demoData.professionals) {
    const created = await createProfessional({
      userId: user.id,
      name: professional.name,
      clientManager: professional.clientManager,
      monthlyRevenue: professional.monthlyRevenue,
    });
    profIdMap[professional.id] = created.id;
  }

  for (const vacation of demoData.vacations) {
    const mappedProfessionalId = profIdMap[vacation.professionalId];
    if (!mappedProfessionalId) continue;

    await createVacationPeriod({
      professionalId: mappedProfessionalId,
      userId: user.id,
      acquisitionStartDate: vacation.acquisitionStartDate,
      acquisitionEndDate: vacation.acquisitionEndDate,
      usageStartDate: vacation.usageStartDate,
      usageEndDate: vacation.usageEndDate,
      totalDays: vacation.totalDays,
      revenueDeduction: vacation.revenueDeduction,
    });
  }

  console.log('Seed demo concluído com sucesso.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
