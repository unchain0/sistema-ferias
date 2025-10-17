'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartsProps {
  data: Array<{ month: string; count: number; impact: number }>;
  shouldAnimate: boolean;
  formatCurrency: (v: number) => string;
}

export default function DashboardCharts({ data, shouldAnimate, formatCurrency }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Férias por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#D1D5DB' }} style={{ fontSize: '12px', fontWeight: 500 }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#D1D5DB' }} style={{ fontSize: '12px' }} />
            <Tooltip formatter={(v: number) => [`${v}`, 'Dias']} />
            <Bar dataKey="count" fill="#3B82F6" name="Dias de Férias" isAnimationActive={shouldAnimate} animationDuration={250} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Impacto Financeiro por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#D1D5DB' }} style={{ fontSize: '12px', fontWeight: 500 }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#D1D5DB' }} style={{ fontSize: '12px' }} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Impacto']} />
            <Bar dataKey="impact" fill="#EF4444" name="Impacto (R$)" isAnimationActive={shouldAnimate} animationDuration={250} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
