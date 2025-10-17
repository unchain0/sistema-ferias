'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartsProps {
  data: Array<{ month: string; count: number; impact: number }>;
  shouldAnimate: boolean;
  formatCurrency: (v: number) => string;
}

export default function DashboardCharts({ data, shouldAnimate, formatCurrency }: ChartsProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) => setIsDark('matches' in e ? e.matches : (e as MediaQueryList).matches);
    apply(mql);
    if ('addEventListener' in mql) {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    } else {
      (mql as any).addListener(apply);
      return () => {
        (mql as any).removeListener(apply);
      };
    }
  }, []);

  const tooltipStyles = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#F9FAFB' : '#111827',
    borderColor: isDark ? '#374151' : '#E5E7EB',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
  } as const;

  const axisTick = { fill: isDark ? '#D1D5DB' : '#4B5563' } as const;
  const axisStroke = isDark ? '#9CA3AF' : '#6B7280';
  const gridStroke = isDark ? '#374151' : '#E5E7EB';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Férias por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" stroke={axisStroke} tick={axisTick} style={{ fontSize: '12px', fontWeight: 500 }} />
            <YAxis stroke={axisStroke} tick={axisTick} style={{ fontSize: '12px' }} />
            <Tooltip
              formatter={(v: number) => [`${v}`, 'Dias']}
              contentStyle={tooltipStyles}
              labelStyle={{ color: tooltipStyles.color, fontWeight: 600 }}
              itemStyle={{ color: tooltipStyles.color }}
            />
            <Bar dataKey="count" fill="#3B82F6" name="Dias de Férias" isAnimationActive={shouldAnimate} animationDuration={250} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Impacto Financeiro por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" stroke={axisStroke} tick={axisTick} style={{ fontSize: '12px', fontWeight: 500 }} />
            <YAxis stroke={axisStroke} tick={axisTick} style={{ fontSize: '12px' }} />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), 'Impacto']}
              contentStyle={tooltipStyles}
              labelStyle={{ color: tooltipStyles.color, fontWeight: 600 }}
              itemStyle={{ color: tooltipStyles.color }}
            />
            <Bar dataKey="impact" fill="#EF4444" name="Impacto (R$)" isAnimationActive={shouldAnimate} animationDuration={250} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
