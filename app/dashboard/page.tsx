'use client';

import { format, subDays } from 'date-fns';
import { Calendar, TrendingDown, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DateRange } from 'react-day-picker';

import { AlertsFeed } from '@/components/features/dashboard/AlertsFeed';
import { Navbar } from '@/components/layout/Navbar';
import { CalendarDateRangePicker } from '@/components/ui/CalendarDateRangePicker';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Controlled range for the picker (default: last 30 days)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: subDays(today, 30), to: today };
  });

  const abortRef = useRef<AbortController | null>(null);
  const hasAnimatedRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

      let url = '/api/dashboard';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        const dashboardData = await response.json();
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
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = useCallback((range: DateRange | undefined) => {
    startTransition(() => {
      setDateRange(range);
    });
  }, []);

  const chartData = useMemo(() => data?.vacationsByMonth ?? [], [data]);
  const alertsData = useMemo(() => data?.alerts ?? [], [data]);
  const deferredChartData = useDeferredValue(chartData);
  const deferredAlertsData = useDeferredValue(alertsData);
  const animateCharts = useMemo(() => deferredChartData.length <= 24, [deferredChartData]);
  const shouldAnimate = animateCharts && !hasAnimatedRef.current;

  const DashboardCharts = useMemo(
    () =>
      dynamic(() => import('@/components/features/dashboard/DashboardCharts'), {
        ssr: false,
        loading: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[360px] w-full" />
            <Skeleton className="h-[360px] w-full" />
          </div>
        ),
      }),
    [],
  );

  useEffect(() => {
    if (data && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
    }
  }, [data]);

  const statCards = [
    {
      title: 'Total de Profissionais',
      value: data?.totalProfessionals,
      icon: Users,
      colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Total de Dias de Férias',
      value: data?.totalVacationDays,
      icon: Calendar,
      colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Impacto no Faturamento',
      value: data ? formatCurrency(data.totalRevenueImpact) : null,
      icon: TrendingDown,
      colorClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Visão geral do impacto financeiro e gestão de férias.
          </p>
        </div>

        {/* Date Range Filter */}
        <CalendarDateRangePicker value={dateRange} onChange={handleFilterChange} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-8 w-[60px]" />
                  </div>
                </Card>
              ))
            : statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.colorClass} p-3 rounded-xl`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Charts Section - Takes up 2/3 width on large screens */}
          <div className="xl:col-span-2 h-full min-h-[400px] space-y-6">
            {loading && !data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : !loading && data && data.totalProfessionals === 0 ? (
              <EmptyState
                icon="users"
                title="Nenhum profissional cadastrado"
                description="Cadastre profissionais para visualizar métricas financeiras e impactos de férias"
              />
            ) : !loading && data && deferredChartData.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Nenhuma férias registrada"
                description="Cadastre períodos de férias para visualizar métricas financeiras e impactos"
              />
            ) : !loading && !data ? (
              <Card className="w-full h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <p className="text-red-500">Erro ao carregar dados do dashboard.</p>
                </div>
              </Card>
            ) : (
              data &&
              deferredChartData.length > 0 && (
                <DashboardCharts
                  data={deferredChartData}
                  shouldAnimate={shouldAnimate}
                  formatCurrency={formatCurrency}
                />
              )
            )}
          </div>

          {/* Alerts/Feed Section - Takes up 1/3 width on large screens */}
          <div className="xl:col-span-1 h-full min-h-[400px]">
            {loading && !data ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <AlertsFeed alerts={deferredAlertsData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
