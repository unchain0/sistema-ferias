'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vacations by Month */}
          {data.vacationsByMonth.length > 0 && (
            <Card title="Férias por Mês">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.vacationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB' }}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB' }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#D1D5DB' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Revenue Impact by Month */}
          {data.vacationsByMonth.length > 0 && (
            <Card title="Impacto Financeiro por Mês">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.vacationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB' }}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB' }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#D1D5DB' }}
                  />
                  <Bar dataKey="impact" fill="#EF4444" name="Impacto (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Professional Impacts Table */}
        {data.professionalImpacts.length > 0 && (
          <Card title="Impacto por Profissional" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Profissional
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Total de Dias
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Impacto no Faturamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.professionalImpacts.map((impact, index) => (
                    <tr
                      key={index}
                      className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {impact.professionalName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {impact.totalDays} dias
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(impact.revenueImpact)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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
