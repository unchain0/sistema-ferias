'use client';

import { Calendar, LayoutDashboard, LogOut, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/professionals', label: 'Profissionais', icon: Users },
    { href: '/vacations', label: 'Férias', icon: Calendar },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 transition-opacity hover:opacity-80"
              >
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    suppressHydrationWarning
                  />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Sistema de Férias
                </span>
              </Link>

              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50',
                      )}
                    >
                      <Icon className="w-4 h-4" suppressHydrationWarning />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4 min-w-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session.user?.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {session.user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4 sm:mr-2" suppressHydrationWarning />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-2">
            <div className="flex justify-around items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors w-full',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                  >
                    <Icon className="w-5 h-5 mb-1" suppressHydrationWarning />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
