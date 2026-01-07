import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { dashboardService } from '@/lib/di';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dashboardData = await dashboardService.getDashboardData(
      session.user.id,
      startDate,
      endDate,
    );

    return NextResponse.json(dashboardData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Dashboard error:', { message, details: error });

    if (message.startsWith('Missing env ')) {
      return NextResponse.json(
        {
          error: 'Configuração do servidor incompleta',
          hint: message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 });
  }
}
