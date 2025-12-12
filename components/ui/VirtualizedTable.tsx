'use client';

import { Virtuoso } from 'react-virtuoso';

interface Row {
  professionalName: string;
  totalDays: number;
  revenueImpact: number;
}

export default function VirtualizedTable({
  items,
  formatCurrency,
}: {
  items: Row[];
  formatCurrency: (v: number) => string;
}) {
  return (
    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <div>Profissional</div>
        <div className="text-right">Total de Dias</div>
        <div className="text-right">Impacto no Faturamento</div>
      </div>
      <Virtuoso
        style={{ height: 400 }}
        totalCount={items.length}
        itemContent={(index: number) => {
          const impact = items[index];
          return (
            <div className="grid grid-cols-3 px-4 py-3 border-b dark:border-gray-800 text-sm">
              <div className="text-gray-900 dark:text-white">{impact.professionalName}</div>
              <div className="text-right text-gray-700 dark:text-gray-300">{impact.totalDays} dias</div>
              <div className="text-right text-gray-700 dark:text-gray-300">{formatCurrency(impact.revenueImpact)}</div>
            </div>
          );
        }}
      />
    </div>
  );
}
