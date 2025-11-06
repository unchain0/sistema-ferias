'use client';

import { useState, useEffect, forwardRef, InputHTMLAttributes } from 'react';
import { convertISOToBR, formatDateForInput } from '@/lib/utils';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      setDisplayValue(convertISOToBR(value));
    }, [value]);

    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: inputValue } = e.target;
      setDisplayValue(inputValue);

      // Basic mask for dd/mm/yyyy
      const formattedInput = inputValue.replace(/[^0-9]/g, '');
      if (formattedInput.length <= 2) {
        setDisplayValue(formattedInput);
      } else if (formattedInput.length <= 4) {
        setDisplayValue(`${formattedInput.slice(0, 2)}/${formattedInput.slice(2)}`);
      } else {
        setDisplayValue(`${formattedInput.slice(0, 2)}/${formattedInput.slice(2, 4)}/${formattedInput.slice(4, 8)}`);
      }
    };

    const handleBlur = () => {
      const isoDate = formatDateForInput(displayValue);
      onChange(isoDate);
      // Update display value to formatted version, or clear if invalid
      setDisplayValue(isoDate ? convertISOToBR(isoDate) : '');
    };

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleDisplayChange}
        onBlur={handleBlur}
        placeholder={placeholder || 'dd/mm/aaaa'}
        className={className}
      />
    );
  }
);

DateInput.displayName = 'DateInput';