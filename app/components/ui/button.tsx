import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive';
  className?: string;
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-3 py-2 rounded';
  const variantClass =
    variant === 'primary'
      ? 'bg-indigo-600 text-white'
      : variant === 'secondary'
      ? 'bg-gray-200 text-gray-900'
      : 'bg-red-600 text-white';
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props} />
  );
}