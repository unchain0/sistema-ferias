'use client';

import { AlertCircle, Eye } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function DemoBanner() {
  const { data: session } = useSession();

  if (session?.user?.email !== 'demo@sistema-ferias.com') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <Eye className="w-4 h-4" suppressHydrationWarning />
        <span className="text-sm font-semibold">Modo Demonstração</span>
        <span className="hidden sm:inline text-sm">
          • Você está explorando o sistema com dados de exemplo
        </span>
        <AlertCircle className="w-4 h-4 hidden md:inline" suppressHydrationWarning />
      </div>
    </div>
  );
}
