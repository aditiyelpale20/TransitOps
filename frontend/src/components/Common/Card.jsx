import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  glow = false,
  ...props
}) => {
  return (
    <div 
      className={`bg-slate-900 border border-brand-border rounded-xl shadow-lg transition-all duration-300 ${
        glow ? 'shadow-brand-accent/5 hover:shadow-brand-accent/10 border-brand-accent/20' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between px-5.5 py-4 border-b border-brand-border ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      )}
      <div className={`p-5.5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
