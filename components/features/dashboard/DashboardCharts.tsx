'use client';

import { BarChart3, TrendingDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartData {
  month: string;
  count: number;
  impact: number;
}

interface ChartsProps {
  data: ChartData[];
  shouldAnimate: boolean;
  formatCurrency: (v: number) => string;
}

export default function DashboardCharts({ data, shouldAnimate, formatCurrency }: ChartsProps) {
  const [isDark, setIsDark] = useState(false);

  // Aggregation Logic
  const processedData = useMemo(() => {
    if (data.length <= 24) return data;

    // If more than 24 months, aggregate by Quarter (or Year if very large)
    // Simple heuristic: if > 48 months (4 years), group by Year. Else Quarter.
    const mode = data.length > 48 ? 'year' : 'quarter';

    const aggregated = data.reduce((acc, curr) => {
      let key = '';
      if (mode === 'year') {
        // Expect format "MMM yyyy" -> extract yyyy
        const parts = curr.month.split(' ');
        key = parts.length > 1 ? parts[1] : curr.month;
      } else {
        // Quarter: "Jan 2024", "Feb 2024", "Mar 2024" -> "Q1 2024"
        // This parsing depends on the locale format returned by API.
        // Assuming "MMM yyyy" (e.g., "jan. 2024" or "Jan 2024")
        const parts = curr.month.split(' ');
        const monthStr = parts[0].toLowerCase().replace('.', '');
        const year = parts.length > 1 ? parts[1] : '';

        const months = [
          'jan',
          'fev',
          'mar',
          'abr',
          'mai',
          'jun',
          'jul',
          'ago',
          'set',
          'out',
          'nov',
          'dez',
        ];
        const monthIndex = months.findIndex((m) => monthStr.startsWith(m));

        if (monthIndex >= 0) {
          const quarter = Math.floor(monthIndex / 3) + 1;
          key = `Q${quarter} ${year}`;
        } else {
          key = curr.month; // Fallback
        }
      }

      const existing = acc.find((item) => item.month === key);
      if (existing) {
        existing.count += curr.count;
        existing.impact += curr.impact;
      } else {
        acc.push({ month: key, count: curr.count, impact: curr.impact });
      }
      return acc;
    }, [] as ChartData[]);

    return aggregated;
  }, [data]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) =>
      setIsDark('matches' in e ? e.matches : (e as MediaQueryList).matches);
    apply(mql);
    if ('addEventListener' in mql) {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    } else {
      const legacyMql = mql as MediaQueryList & {
        addListener: (cb: (e: MediaQueryListEvent) => void) => void;
        removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
      };
      legacyMql.addListener(apply);
      return () => {
        legacyMql.removeListener(apply);
      };
    }
  }, []);

  const tooltipStyles = {
    backgroundColor: isDark ? '#18181b' : '#ffffff', // Zinc 900 / White
    color: isDark ? '#fafafa' : '#18181b', // Zinc 50 / Zinc 900
    borderColor: isDark ? '#27272a' : '#e4e4e7', // Zinc 800 / Zinc 200
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    padding: '12px 16px',
  } as const;

  const axisTick = { fill: isDark ? '#a1a1aa' : '#71717a' } as const; // Zinc 400 / Zinc 500
  const axisStroke = isDark ? '#52525b' : '#a1a1aa'; // Zinc 600 / Zinc 400
  const gridStroke = isDark ? '#27272a' : '#f4f4f5'; // Zinc 800 / Zinc 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Vacation Days Chart */}
      <div className="group bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300">
        {/* Header with gradient accent */}
        <div className="relative p-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40">
              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Férias por Período
            </h3>
          </div>
        </div>
        <div className="px-6 pb-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px', fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px' }}
                dx={-5}
              />
              <Tooltip
                formatter={(v: number) => [`${v} dias`, 'Férias']}
                contentStyle={tooltipStyles}
                cursor={{ fill: isDark ? '#27272a' : '#f4f4f5', opacity: 0.5, radius: 4 }}
                labelStyle={{
                  color: tooltipStyles.color,
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{ color: '#6366f1', fontVariantNumeric: 'tabular-nums' }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradientBlue)"
                name="Dias de Férias"
                radius={[6, 6, 0, 0]}
                isAnimationActive={shouldAnimate}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Impact Chart */}
      <div className="group bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-rose-100/50 dark:hover:shadow-rose-900/20 transition-all duration-300">
        {/* Header with gradient accent */}
        <div className="relative p-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Impacto Financeiro
            </h3>
          </div>
        </div>
        <div className="px-6 pb-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradientRose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px', fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px' }}
                dx={-5}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Impacto']}
                contentStyle={tooltipStyles}
                cursor={{ stroke: isDark ? '#f43f5e' : '#f43f5e', strokeWidth: 2 }}
                labelStyle={{
                  color: tooltipStyles.color,
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{ color: '#f43f5e', fontVariantNumeric: 'tabular-nums' }}
              />
              <Area
                type="monotone"
                dataKey="impact"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGradientRose)"
                name="Impacto (R$)"
                isAnimationActive={shouldAnimate}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
