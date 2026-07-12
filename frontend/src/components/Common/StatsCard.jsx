import React from 'react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend, // { type: 'up' | 'down', value: '5.2%' }
  statusText,
  iconColor = 'text-brand-accent bg-brand-accent/10',
  className = ''
}) => {
  return (
    <div className={`bg-slate-900 border border-brand-border rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-850 transition-all hover:shadow-xl ${className}`}>
      <div className="flex items-start justify-between gap-1.5 w-full">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 leading-tight block break-words min-w-0 flex-1">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg shrink-0 ${iconColor} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-brand-title">
          {value}
        </h3>
        
        {trend && (
          <span className={`text-xs font-bold flex items-center ${
            trend.type === 'up' ? 'text-emerald-400' : 'text-rose-450 text-red-400'
          }`}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      
      {statusText && (
        <div className="mt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          {statusText}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
