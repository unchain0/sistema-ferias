'use client';

import { Users, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo, useRef, startTransition, useDeferredValue } from 'react';

import { Card } from '@/components/card';
import { DateRangeFilter, type DateRange } from '@/components/date-range-filter';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Navbar } from '@/components/navbar';
import { formatCurrency } from '@/lib/utils';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const abortReference = useRef<AbortController | null>(null);
  const hasAnimatedReference = useRef(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      if (abortReference.current) abortReference.current.abort();
      const controller = new AbortController();
      abortReference.current = controller;

      let url = '/api/dashboard';
      if (dateRange) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        const dashboardData = (await response.json()) as DashboardData;
        setData(dashboardData);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching dashboard:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = (range: DateRange | null) => {
    startTransition(() => {
      setDateRange(range);
    });
  };

  const chartData = useMemo(() => data?.vacationsByMonth ?? [], [data]);
  const tableData = useMemo(() => data?.professionalImpacts ?? [], [data]);
  const deferredChartData = useDeferredValue(chartData);
  const deferredTableData = useDeferredValue(tableData);
  const animateCharts = useMemo(() => deferredChartData.length <= 24, [deferredChartData]);
  const shouldAnimate = animateCharts && !hasAnimatedReference.current;

  const DashboardCharts = useMemo(() => dynamic(() => import('@/components/dashboard-charts'), {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[360px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-[360px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    )
  }), []);

  const VirtualizedTable = useMemo(() => dynamic(() => import('@/components/virtualized-table'), {
    ssr: false,
    loading: () => <div className="h-[420px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
  }), []);

  useEffect(() => {
    if (data && !hasAnimatedReference.current) {
      hasAnimatedReference.current = true;
    }
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Erro ao carregar dados do dashboard
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Profissionais',
      value: data.totalProfessionals,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total de Dias de Férias',
      value: data.totalVacationDays,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Impacto no Faturamento',
      value: formatCurrency(data.totalRevenueImpact),
      icon: TrendingDown,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard de Impacto Financeiro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualização do impacto financeiro das férias dos profissionais
          </p>
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter onFilterChange={handleFilterChange} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        {deferredChartData.length > 0 && (
          <DashboardCharts data={deferredChartData} shouldAnimate={shouldAnimate} formatCurrency={formatCurrency} />
        )}

        {/* Professional Impacts Table */}
        {deferredTableData.length > 0 && (
          <div className="mt-6">
            <VirtualizedTable items={deferredTableData} formatCurrency={formatCurrency} />
          </div>
        )}

        {/* Empty State */}
        {data.totalProfessionals === 0 && (
          <Card className="mt-6">
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comece cadastrando profissionais e períodos de férias
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
