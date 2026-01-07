'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  } as const;

  const axisTick = { fill: isDark ? '#a1a1aa' : '#71717a' } as const; // Zinc 400 / Zinc 500
  const axisStroke = isDark ? '#52525b' : '#a1a1aa'; // Zinc 600 / Zinc 400
  const gridStroke = isDark ? '#27272a' : '#f4f4f5'; // Zinc 800 / Zinc 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Férias por Período
        </h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '12px', fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '12px' }}
                dx={-10}
              />
              <Tooltip
                formatter={(v: number) => [`${v}`, 'Dias']}
                contentStyle={tooltipStyles}
                cursor={{ fill: isDark ? '#27272a' : '#f4f4f5', opacity: 0.5 }}
                labelStyle={{
                  color: tooltipStyles.color,
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
                itemStyle={{ color: tooltipStyles.color }}
              />
              <Bar
                dataKey="count"
                fill="#4f46e5"
                name="Dias de Férias"
                radius={[4, 4, 0, 0]}
                isAnimationActive={shouldAnimate}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Impacto Financeiro
        </h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '12px', fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                stroke={axisStroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '12px' }}
                dx={-10}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Impacto']}
                contentStyle={tooltipStyles}
                cursor={{ fill: isDark ? '#27272a' : '#f4f4f5', opacity: 0.5 }}
                labelStyle={{
                  color: tooltipStyles.color,
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
                itemStyle={{ color: tooltipStyles.color }}
              />
              <Bar
                dataKey="impact"
                fill="#e11d48"
                name="Impacto (R$)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={shouldAnimate}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
