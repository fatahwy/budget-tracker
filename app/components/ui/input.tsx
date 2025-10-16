import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input ref={ref} className={`border rounded px-3 py-2 ${className}`} {...props} />
  );
});

Input.displayName = 'Input';

export default Input;