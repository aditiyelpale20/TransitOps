import React from 'react';

const ChartCard = ({
  title,
  subtitle,
  children,
  className = '',
  action
}) => {
  return (
    <div className={`bg-slate-900 border border-brand-border rounded-xl p-5 shadow-lg flex flex-col hover:border-slate-800 transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
