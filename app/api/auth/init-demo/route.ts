import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, createProfessional, createVacationPeriod, initializeMemoryStorage } from '@/lib/db';
import { createDemoData } from '@/lib/seed-demo';

const IS_SERVERLESS = process.env.VERCEL === '1' || (process.env.NODE_ENV === 'production' && !process.env.USE_FILESYSTEM);

export async function POST() {
  try {
    const demoData = await createDemoData();
    
    // For serverless environments, initialize memory storage directly
    if (IS_SERVERLESS) {
      await initializeMemoryStorage(demoData);
      return NextResponse.json({ 
        message: 'Dados demo inicializados com sucesso (in-memory)',
        email: demoData.user.email 
      });
    }
    
    // For local development, use filesystem
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
