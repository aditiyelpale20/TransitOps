import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label} {required && <span className="text-brand-accent">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`block w-full rounded-lg bg-slate-900 border ${
            error ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-slate-800 focus:ring-brand-accent focus:border-brand-accent'
          } text-brand-title placeholder-slate-500 text-sm py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-1 ${
            Icon ? 'pl-11' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error.message || error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
