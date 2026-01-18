import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-50',
        className,
      )}
    >
      {title && (
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 pt-4">{children}</div>
    </div>
  );
}
