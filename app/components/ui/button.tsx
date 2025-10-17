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
  const base = 'px-2 py-1 rounded cursor-pointer';
  const variantClass = {
    primary: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    secondary: 'bg-gray-200 text-gray-900',
    danger: 'bg-red-600 text-white',
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