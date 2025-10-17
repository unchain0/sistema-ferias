export const dynamic = 'force-static';
import NextDynamic from 'next/dynamic';
import { Card } from '@/components/Card';
import { Suspense } from 'react';

const LoginForm = NextDynamic(() => import('@/components/LoginForm').then(m => m.LoginForm));

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Férias</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Faça login para continuar</p>
        </div>
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
