import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { label: string; value: string | number }[];
}

const Input = forwardRef<any, InputProps>(({
  label,
  error,
  as = 'input',
  className = '',
  options,
  ...props
}, ref) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`;

  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      
      {as === 'textarea' ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={inputClass}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          className={inputClass}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          <option value="" disabled hidden>Chọn...</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={inputClass}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
