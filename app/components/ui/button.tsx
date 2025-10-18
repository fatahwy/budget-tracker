import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
};

export function Button({ variant = 'primary', className = '', title, disabled, ...props }: ButtonProps) {
  const base = 'px-3 py-2 rounded cursor-pointer';
  const variantClass = {
    primary: `bg-indigo-600 text-white ${!disabled && `hover:bg-indigo-700`}`,
    success: `bg-green-600 text-white ${!disabled && `hover:bg-green-700`}`,
    secondary: `bg-gray-200 text-gray-900 ${!disabled && `hover:bg-gray-300`}`,
    danger: `bg-red-600 text-white ${!disabled && `hover:bg-red-700`}`,
  }

  const btn = <button className={`${base} ${variantClass[variant] || ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} {...props} />;

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent>
          {title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return btn;
}