import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [], // [{ value: 'x', label: 'X' }] or simple strings
  error,
  icon: Icon,
  className = '',
  required = false,
  placeholder = 'Select option...',
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
        <select
          ref={ref}
          className={`block w-full rounded-lg bg-slate-900 border ${
            error ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-slate-800 focus:ring-brand-accent focus:border-brand-accent'
          } text-brand-title text-sm py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-1 appearance-none cursor-pointer ${
            Icon ? 'pl-11' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-slate-900 text-brand-title">
                {text}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error.message || error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
