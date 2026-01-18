import { Calendar, DollarSign, Users } from 'lucide-react';

import { Card } from '@/components/ui/Card';

interface EmptyStateProps {
  icon?: 'calendar' | 'dollar' | 'users';
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const Icon = icon === 'calendar' ? Calendar : icon === 'users' ? Users : DollarSign;

  return (
    <Card className="w-full h-full flex items-center justify-center">
      <div className="text-center py-12 px-4">
        <Icon
          className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-gray-600"
          suppressHydrationWarning
        />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </Card>
  );
}
