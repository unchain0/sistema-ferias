import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getVacationPeriods, createVacationPeriod, getProfessionalById } from '@/lib/db-switch';
import { VacationPeriod } from '@/types';
import { calculateVacationDays, calculateRevenueDeduction } from '@/lib/utils';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Parse pagination and ordering params with sensible defaults
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const orderParam = searchParams.get('order') || 'createdAt:desc';

  const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200);
  const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0);

  const [orderField, orderDir] = orderParam.split(':');
  
  // Validate orderField to ensure it's a valid key of VacationPeriod
  const validOrderFields = ['id', 'professionalId', 'userId', 'acquisitionStartDate', 'acquisitionEndDate', 
                            'usageStartDate', 'usageEndDate', 'totalDays', 'revenueDeduction', 'createdAt', 'updatedAt'];
  const validatedOrderField = validOrderFields.includes(orderField) ? orderField : 'createdAt';

  const all = await getVacationPeriods(session.user.id);

  // Stable sort to avoid shifting order between responses
  const sorted = [...all].sort((a, b) => {
    const dir = orderDir?.toLowerCase() === 'asc' ? 1 : -1;
    const aVal = (a as any)[validatedOrderField as keyof VacationPeriod] ?? '';
    const bVal = (b as any)[validatedOrderField as keyof VacationPeriod] ?? '';
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    // tie-breaker by id for determinism
    return a.id.localeCompare(b.id) * dir;
  });

  const paged = sorted.slice(offset, offset + limit);

  const headers = new Headers();
  headers.set('X-Total-Count', String(all.length));
  // Private caching for logged-in user with must-revalidate to ensure data consistency
  headers.set('Cache-Control', 'private, max-age=5, must-revalidate');
  headers.set('Vary', 'Cookie');

  return NextResponse.json(paged, { headers });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const data = await request.json();
    const {
      professionalId,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    } = data;

    if (!professionalId || !acquisitionStartDate || !acquisitionEndDate || !usageStartDate || !usageEndDate) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const professional = await getProfessionalById(professionalId, session.user.id);
    
    if (!professional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    const created = await createVacationPeriod({
      professionalId,
      userId: session.user.id,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
      totalDays,
      revenueDeduction,
    });
    const headers = new Headers();
    // Ensure mutations are never cached
    headers.set('Cache-Control', 'no-store');
    return NextResponse.json(created, { status: 201, headers });
  } catch (error) {
    console.error('Create vacation error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar período de férias' },
      { status: 500 }
    );
  }
}
