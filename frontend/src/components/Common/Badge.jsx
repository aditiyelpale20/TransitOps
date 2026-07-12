import React from 'react';

const Badge = ({
  status,
  children,
  className = ''
}) => {
  const label = children || status;
  
  const statusStyles = {
    // Vehicles / Drivers
    available: 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400',
    active: 'bg-blue-950/60 border border-blue-500/30 text-blue-400',
    'on trip': 'bg-blue-950/60 border border-blue-500/30 text-blue-400',
    ontrip: 'bg-blue-950/60 border border-blue-500/30 text-blue-400',
    'in shop': 'bg-amber-950/60 border border-amber-500/30 text-amber-400',
    inshop: 'bg-amber-950/60 border border-amber-500/30 text-amber-400',
    suspended: 'bg-red-950/60 border border-red-500/30 text-red-400',
    retired: 'bg-slate-900 border border-slate-700 text-slate-500',
    
    // Trips
    loading: 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-400',
    delayed: 'bg-rose-950/60 border border-rose-500/30 text-rose-400',
    arrived: 'bg-teal-950/60 border border-teal-500/30 text-teal-400',
    arriving: 'bg-teal-950/60 border border-teal-500/30 text-teal-400',
    completed: 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400',
    pending: 'bg-amber-950/60 border border-amber-500/30 text-amber-400',
    
    // Default fallback styles
    default: 'bg-slate-800 border border-slate-700 text-slate-300'
  };

  const getStyle = (statusStr) => {
    if (!statusStr) return statusStyles.default;
    const lower = statusStr.toLowerCase().trim().replace(/[\s\-_]/g, '');
    return statusStyles[lower] || statusStyles[statusStr.toLowerCase()] || statusStyles.default;
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStyle(status)} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
