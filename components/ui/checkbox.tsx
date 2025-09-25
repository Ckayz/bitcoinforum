'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ id, checked, onCheckedChange, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
        ${checked 
          ? 'bg-orange-500 border-orange-500' 
          : 'bg-transparent border-zinc-600 hover:border-orange-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900
      `}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  );
}
