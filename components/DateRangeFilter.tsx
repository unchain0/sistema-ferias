'use client';

import { useState, startTransition } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { Calendar } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  onFilterChange: (range: DateRange | null) => void;
}

type QuickFilter = 'month' | '3months' | '6months' | 'year' | 'all' | 'custom';

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const quickFilters = [
    { id: 'all' as QuickFilter, label: 'Todos os Períodos' },
    { id: 'month' as QuickFilter, label: 'Este Mês' },
    { id: '3months' as QuickFilter, label: 'Últimos 3 Meses' },
    { id: '6months' as QuickFilter, label: 'Últimos 6 Meses' },
    { id: 'year' as QuickFilter, label: 'Este Ano' },
    { id: 'custom' as QuickFilter, label: 'Personalizado' },
  ];

  const applyQuickFilter = (filterId: QuickFilter) => {
    startTransition(() => {
      setActiveFilter(filterId);
    });
    const today = new Date();

    switch (filterId) {
      case 'month':
        onFilterChange({
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        });
        break;
      case '3months':
        onFilterChange({
          startDate: format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        });
        break;
      case '6months':
        onFilterChange({
          startDate: format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        });
        break;
      case 'year':
        onFilterChange({
          startDate: format(startOfYear(today), 'yyyy-MM-dd'),
          endDate: format(endOfYear(today), 'yyyy-MM-dd'),
        });
        break;
      case 'all':
        onFilterChange(null);
        break;
      case 'custom':
        // Custom será aplicado quando usuário definir as datas
        break;
    }
  };

  const applyCustomFilter = () => {
    if (!customStartDate || !customEndDate) return;
    onFilterChange({ startDate: customStartDate, endDate: customEndDate });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Filtrar por Período
        </h3>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => applyQuickFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {activeFilter === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              lang="pt-BR"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Final
            </label>
            <input
              type="date"
              lang="pt-BR"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={applyCustomFilter}
              disabled={!customStartDate || !customEndDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
