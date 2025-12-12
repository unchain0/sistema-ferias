'use client';

import { Alert } from '@/types';
import { Card } from '@/components/ui/Card';
import { AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { formatDateToPtBR } from '@/lib/utils';

interface AlertsFeedProps {
  alerts: Alert[];
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card title="Alertas e Atualizações" className="h-full">
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
          <CheckCircle2 className="w-12 h-12 mb-3 text-green-500/50" />
          <p>Tudo certo! Sem alertas pendentes.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Alertas e Atualizações" className="h-full">
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border flex items-start space-x-3 transition-colors ${
              alert.type === 'expiring_period'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}
          >
            <div className={`p-2 rounded-full ${
                alert.type === 'expiring_period' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
            }`}>
              {alert.type === 'expiring_period' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CalendarClock className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {alert.professionalName}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {alert.type === 'upcoming_vacation' ? 'Férias agendadas' : 'Período concessivo'}
              </p>
              <p className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-200">
                {alert.details}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Data ref: {formatDateToPtBR(alert.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
