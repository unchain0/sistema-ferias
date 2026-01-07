import { forwardRef, InputHTMLAttributes, useId } from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type, placeholder, lang, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const resolvedPlaceholder = placeholder;
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500',
            error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className,
          )}
          type={type}
          placeholder={resolvedPlaceholder}
          {...(lang ? { lang } : {})}
          {...props}
        />
        {error && <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
