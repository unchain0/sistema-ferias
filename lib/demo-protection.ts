import { NextResponse } from 'next/server';

export function isDemoUser(email?: string | null): boolean {
  return email === 'demo@sistema-ferias.com';
}

export function createDemoProtectionResponse() {
  return NextResponse.json(
    { 
      error: 'Modo demonstração: Modificações não são permitidas',
      demo: true 
    },
    { status: 403 }
  );
}
