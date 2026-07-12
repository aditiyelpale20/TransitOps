import React from 'react';
import { FiBell, FiSearch, FiHelpCircle } from 'react-icons/fi';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onSearchChange, searchQuery }) => {
  const { user } = useAuth();
  
  // Local state for Dark Mode UI Toggle (since request specified UI only)
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const getInitials = (name) => {
    if (!name) return 'TR';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getSearchPlaceholder = () => {
    const role = user?.role || 'Fleet Manager';
    if (role === 'Fleet Manager') return "Search fleet units, maintenance logs, and vehicles...";
    if (role === 'Dispatcher') return "Search active routes, transits, and available drivers...";
    if (role === 'Safety Officer') return "Search driver safety ratings, compliance, and alerts...";
    if (role === 'Financial Analyst') return "Search operational expenses, invoices, and fuel ledgers...";
    return "Search...";
  };

  const getStatusBadge = () => {
    const role = user?.role || 'Fleet Manager';
    if (role === 'Fleet Manager') return { text: "Fleet Manager Terminal", color: "text-blue-400 bg-blue-950/45 border-blue-500/20" };
    if (role === 'Dispatcher') return { text: "Dispatcher Terminal", color: "text-indigo-400 bg-indigo-950/45 border-indigo-500/20" };
    if (role === 'Safety Officer') return { text: "Safety Officer Terminal", color: "text-emerald-400 bg-emerald-950/45 border-emerald-500/20" };
    if (role === 'Financial Analyst') return { text: "Financial Analyst Terminal", color: "text-amber-400 bg-amber-950/45 border-amber-500/20" };
    return { text: "System Live", color: "text-slate-400 bg-slate-950/45 border-slate-500/20" };
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="h-16 bg-brand-dark/40 backdrop-blur-md border-b border-brand-border sticky top-0 z-30 px-6 flex items-center justify-between">
      
      {/* Search Input bar */}
      <div className="w-96 relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={getSearchPlaceholder()}
          className="w-full bg-slate-900/60 border border-brand-border/80 focus:border-brand-accent rounded-lg py-2 pl-10 pr-4 text-xs font-semibold placeholder-slate-500 text-brand-title focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
        />
      </div>
 
      {/* Utilities Group */}
      <div className="flex items-center space-x-5">
        
        {/* Status Indicator */}
        <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusBadge.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{statusBadge.text}</span>
        </div>

        {/* Dark Mode toggler */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-lg border border-brand-border text-slate-400 hover:text-brand-title hover:bg-slate-800 transition-colors"
          title="Toggle UI Theme"
        >
          {isDarkMode ? <MdOutlineLightMode className="h-5 w-5" /> : <MdOutlineDarkMode className="h-5 w-5" />}
        </button>

        {/* Notifications Icon with Badge */}
        <button className="p-1.5 rounded-lg border border-brand-border text-slate-400 hover:text-brand-title hover:bg-slate-800 relative transition-colors">
          <FiBell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent" />
        </button>

        {/* Help icon */}
        <button className="p-1.5 rounded-lg border border-brand-border text-slate-400 hover:text-brand-title hover:bg-slate-800 transition-colors">
          <FiHelpCircle className="h-5 w-5" />
        </button>

        {/* Quick User summary */}
        <div className="flex items-center space-x-3.5 pl-3 border-l border-brand-border">
          <div className="text-right">
            <h5 className="text-[10px] font-black uppercase text-brand-title tracking-wider">
              {user?.name || "Alex Rivera"}
            </h5>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block -mt-0.5">
              {user?.role || "Fleet Director"}
            </span>
          </div>
          <div className="w-8.5 h-8.5 rounded-lg border border-brand-accent/25 bg-brand-accent/15 flex items-center justify-center text-brand-accent font-black text-xs shrink-0 uppercase tracking-wider">
            {getInitials(user?.name)}
          </div>
        </div>

      </div>

    </header>
  );
};

export default Navbar;
