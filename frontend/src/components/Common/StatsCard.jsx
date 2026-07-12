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
    <div className={`bg-slate-900 border border-brand-border rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-800 transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="h-4.5 w-4.5" />
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
