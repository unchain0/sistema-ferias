import { NextResponse } from 'next/server';
import { getUsers, getUserByEmail, createUser, getProfessionals, createProfessional, getVacationPeriods, createVacationPeriod } from '@/lib/db';
import { createDemoData } from '@/lib/seed-demo';

export async function POST() {
  try {
    const demoData = await createDemoData();
    
    // Check if demo user already exists
    const existingUser = await getUserByEmail(demoData.user.email);
    
    if (!existingUser) {
      // Create demo user
      await createUser(demoData.user);
      
      // Create demo professionals
      for (const professional of demoData.professionals) {
        await createProfessional(professional);
      }
      
      // Create demo vacations
      for (const vacation of demoData.vacations) {
        await createVacationPeriod(vacation);
      }
    }

    return NextResponse.json({ 
      message: 'Dados demo inicializados com sucesso',
      email: demoData.user.email 
    });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar dados demo' },
      { status: 500 }
    );
  }
}
