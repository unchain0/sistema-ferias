import { NextResponse } from 'next/server';

import { DEMO_USER_EMAIL } from './constants';

export function isDemoUser(email?: string | null): boolean {
  return email === DEMO_USER_EMAIL;
}

export function createDemoProtectionResponse() {
  return NextResponse.json(
    {
      error: 'Modo demonstração: Modificações não são permitidas',
      demo: true,
    },
    { status: 403 },
  );
}
