'use client';

import { AlertCircle, Bell, CalendarClock, CheckCircle2 } from 'lucide-react';

import { cn, formatDateToPtBR } from '@/lib/utils';
import { Alert } from '@/types';

interface AlertsFeedProps {
  alerts: Alert[];
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Alertas e Atualizações</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[280px] text-gray-500 p-6">
          <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="font-medium text-gray-900 dark:text-white">Tudo certo!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sem alertas pendentes no momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Alertas e Atualizações</h3>
          </div>
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-semibold text-amber-700 dark:text-amber-300">
            {alerts.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={cn(
              'p-4 rounded-xl border transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              alert.type === 'expiring_period'
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/50'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/50',
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0',
                  alert.type === 'expiring_period'
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
                )}
              >
                {alert.type === 'expiring_period' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CalendarClock className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {alert.professionalName}
                  </h4>
                  <span
                    className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0',
                      alert.type === 'expiring_period'
                        ? 'bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200'
                        : 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200',
                    )}
                  >
                    {alert.type === 'upcoming_vacation' ? 'Férias' : 'Período'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5 leading-relaxed">
                  {alert.details}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {formatDateToPtBR(alert.date)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
