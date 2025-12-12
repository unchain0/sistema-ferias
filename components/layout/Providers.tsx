'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ToasterDynamic = dynamic(() => import('react-hot-toast').then(m => m.Toaster), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return (
      <>
        {children}
        <ToasterDynamic
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </>
    );
  }

  return (
    <SessionProvider>
      {children}
      <ToasterDynamic
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </SessionProvider>
  );
}
