import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { getVacationPeriods, createVacationPeriod, getProfessionalById } from '@/lib/db-switch';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';
import { calculateVacationDays, calculateRevenueDeduction } from '@/lib/utils';

interface CreateVacationBody {
  readonly professionalId: string;
  readonly acquisitionStartDate: string;
  readonly acquisitionEndDate: string;
  readonly usageStartDate: string;
  readonly usageEndDate: string;
}

const VALID_ORDER_FIELDS = [
  'id',
  'professionalId',
  'userId',
  'acquisitionStartDate',
  'acquisitionEndDate',
  'usageStartDate',
  'usageEndDate',
  'totalDays',
  'revenueDeduction',
  'createdAt',
] as const;

type ValidOrderField = typeof VALID_ORDER_FIELDS[number];

export async function GET(request: Request): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- explicit check preferred for clarity
  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Parse pagination and ordering params with sensible defaults
  const { searchParams } = new URL(request.url);
  const limitParameter = searchParams.get('limit');
  const offsetParameter = searchParams.get('offset');
  const orderParameter = searchParams.get('order') ?? 'createdAt:desc';

  const limit = Math.min(Math.max(Number.parseInt(limitParameter ?? '50', 10), 1), 200);
  const offset = Math.max(Number.parseInt(offsetParameter ?? '0', 10), 0);

  const [orderFieldRaw, orderDirectionRaw] = orderParameter.split(':');
  const orderDirection = orderDirectionRaw?.toLowerCase() === 'asc' ? 1 : -1;
  const validatedOrderField: ValidOrderField = VALID_ORDER_FIELDS.includes(orderFieldRaw as ValidOrderField)
    ? (orderFieldRaw as ValidOrderField)
    : 'createdAt';

  const all = await getVacationPeriods(session.user.id);

  // Stable sort to avoid shifting order between responses
  const sorted = [...all].sort((a, b) => {
    const aValue = a[validatedOrderField] ?? '';
    const bValue = b[validatedOrderField] ?? '';
    if (aValue < bValue) return -1 * orderDirection;
    if (aValue > bValue) return 1 * orderDirection;
    // tie-breaker by id for determinism
    return a.id.localeCompare(b.id) * orderDirection;
  });

  const paged = sorted.slice(offset, offset + limit);

  const headers = new Headers();
  headers.set('X-Total-Count', String(all.length));
  // Private caching for logged-in user with must-revalidate to ensure data consistency
  headers.set('Cache-Control', 'private, max-age=5, must-revalidate');
  headers.set('Vary', 'Cookie');

  return NextResponse.json(paged, { headers });
}

export async function POST(request: Request): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- explicit check preferred for clarity
  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- email is guaranteed to exist after session check
  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const data = (await request.json()) as CreateVacationBody;
    const {
      professionalId,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    } = data;

    if (
      professionalId === '' ||
      acquisitionStartDate === '' ||
      acquisitionEndDate === '' ||
      usageStartDate === '' ||
      usageEndDate === ''
    ) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const professional = await getProfessionalById(professionalId, session.user.id);

    if (professional === null) {
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