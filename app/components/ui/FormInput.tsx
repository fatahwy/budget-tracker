import React from 'react';

export type FormInputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  // Render as input or textarea
  as?: 'input' | 'textarea';
  rows?: number;
  className?: string;
};

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  required = true,
  as = 'input',
  rows = 3,
  className = '',
  ...rest
}) => {
  const inputClass = `block w-full rounded-md px-3 py-2 shadow-sm border ${
    error ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
  } focus:border-indigo-500 focus:ring-indigo-500 ${className}`;

  if (as === 'textarea') {
    return (
      <div>
        <label htmlFor={id ?? label} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <textarea
          id={id ?? label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={inputClass}
          required={required}
          {...rest}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id ?? label} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id ?? label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
        required={required}
        {...rest}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;