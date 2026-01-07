export const dynamic = 'force-static';
import NextDynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense } from 'react';

import { Card } from '@/components/ui/Card';

const LoginForm = NextDynamic(() =>
  import('@/components/features/auth/LoginForm').then((m) => m.LoginForm),
);

export default function LoginPage() {
  return (
    <div className="page-container-auth">
      {/* Background illustration - positioned absolutely */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src="/vacation-illustration.png"
          alt=""
          width={800}
          height={600}
          className="absolute bottom-0 right-0 w-[600px] h-auto opacity-30 dark:opacity-20 select-none"
          priority
        />
        <Image
          src="/vacation-illustration.png"
          alt=""
          width={800}
          height={600}
          className="absolute top-0 left-0 w-[500px] h-auto opacity-20 dark:opacity-10 select-none rotate-180 scale-x-[-1]"
          priority
        />
      </div>

      <Card className="w-full max-w-md relative z-10">
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
