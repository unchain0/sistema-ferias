export const dynamic = 'force-static';
import NextDynamic from 'next/dynamic';
import { Suspense } from 'react';

import { Card } from '@/components/ui/Card';

const LoginForm = NextDynamic(() =>
  import('@/components/features/auth/LoginForm').then((m) => m.LoginForm),
);

export default function LoginPage() {
  return (
    <div className="page-container-auth">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Férias</h1>
          <p className="text-muted mt-1">Faça login para continuar</p>
        </div>
        <Suspense
          fallback={
            <div className="loading-pulse">
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
