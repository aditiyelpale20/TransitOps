import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary (gold), secondary (dark gray/slate), outline (border gray), danger (red), success (green)
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-accent hover:bg-brand-hover text-brand-dark shadow-sm font-semibold',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-brand-title border border-slate-700',
    outline: 'border border-brand-border text-brand-text hover:text-brand-title hover:bg-slate-850',
    danger: 'bg-red-900/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 focus:ring-red-500',
    success: 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/80 focus:ring-emerald-500',
    blue: 'bg-brand-blueAccent/20 border border-brand-blueAccent/30 text-brand-blueAccent hover:bg-brand-blueAccent/30 focus:ring-brand-blueAccent'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-4.5 w-4.5" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
