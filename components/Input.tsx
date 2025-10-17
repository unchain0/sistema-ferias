import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { APP_LOCALE } from '@/lib/i18n';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type, placeholder, lang, ...props }, ref) => {
    const isDate = type === 'date';
    const resolvedPlaceholder = placeholder; // do not force date placeholder
    const resolvedLang = lang ?? (isDate ? APP_LOCALE : undefined);
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'dark:bg-gray-800 dark:border-gray-700 dark:text-white',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          type={type}
          placeholder={resolvedPlaceholder}
          lang={resolvedLang}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
