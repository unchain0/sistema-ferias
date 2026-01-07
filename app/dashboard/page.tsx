'use client';

import { format, subDays } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  TrendingDown,
  Users,
} from 'lucide-react';
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
import { cn, formatCurrency } from '@/lib/utils';
import { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Controlled range for the picker (default: last year)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: subDays(today, 365), to: today };
  });

  const abortRef = useRef<AbortController | null>(null);
  const hasAnimatedRef = useRef(false);

  const fetchDashboard = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
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
        setIsRefreshing(false);
      }
    },
    [dateRange],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = useCallback((range: DateRange | undefined) => {
    startTransition(() => {
      setDateRange(range);
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

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
            <Skeleton className="h-[360px] w-full rounded-xl" />
            <Skeleton className="h-[360px] w-full rounded-xl" />
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
      trend: null,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total de Dias de Férias',
      value: data?.totalVacationDays,
      icon: Calendar,
      trend: data?.totalVacationDays && data.totalVacationDays > 0 ? 'up' : null,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Impacto no Faturamento',
      value: data ? formatCurrency(data.totalRevenueImpact) : null,
      icon: TrendingDown,
      trend: data?.totalRevenueImpact && data.totalRevenueImpact > 0 ? 'down' : null,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-3">
              Visão geral do impacto financeiro e gestão de férias
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
              'text-gray-600 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Atualizar
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CalendarDateRangePicker value={dateRange} onChange={handleFilterChange} />
          {loading && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Carregando dados...
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6"
                >
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                </div>
              ))
            : statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800',
                      'bg-gradient-to-br',
                      stat.bgGradient,
                      'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50',
                      'transition-all duration-300 ease-out',
                      'hover:-translate-y-0.5',
                    )}
                  >
                    {/* Decorative gradient bar */}
                    <div
                      className={cn(
                        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                        stat.gradient,
                      )}
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {stat.value ?? '-'}
                            </p>
                            {stat.trend && (
                              <span
                                className={cn(
                                  'flex items-center text-xs font-medium',
                                  stat.trend === 'up'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400',
                                )}
                              >
                                {stat.trend === 'up' ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            'p-3 rounded-xl transition-transform duration-300',
                            'group-hover:scale-110',
                            stat.iconBg,
                          )}
                        >
                          <Icon className={cn('w-6 h-6', stat.iconColor)} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Charts Section - Takes up 2/3 width on large screens */}
          <div className="xl:col-span-2 h-full min-h-[400px] space-y-6">
            {loading && !data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
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
              <Skeleton className="h-[400px] w-full rounded-xl" />
            ) : (
              <AlertsFeed alerts={deferredAlertsData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
