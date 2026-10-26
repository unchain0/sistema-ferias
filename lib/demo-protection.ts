import { NextResponse } from 'next/server';

import { isDemoEmail } from './seed-demo';

export function isDemoUser(email?: string | null): boolean {
  return isDemoEmail(email);
}

export function createDemoProtectionResponse(): ReturnType<typeof NextResponse.json> {
  return NextResponse.json(
    {
      error: 'Modo demonstração: Modificações não são permitidas',
      demo: true,
    },
    { status: 403 }
  );
}