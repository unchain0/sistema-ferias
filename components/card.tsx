import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';


interface CardProperties {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProperties) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200',
        'hover:shadow-lg',
        className
      )}
    >
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
