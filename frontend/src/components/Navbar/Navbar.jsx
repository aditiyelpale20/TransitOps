import React from 'react';
import { FiBell, FiSearch, FiHelpCircle } from 'react-icons/fi';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onSearchChange, searchQuery }) => {
  const { user } = useAuth();
  
  // Local state for Dark Mode UI Toggle (since request specified UI only)
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  return (
    <header className="h-16 bg-brand-dark/40 backdrop-blur-md border-b border-brand-border sticky top-0 z-30 px-6 flex items-center justify-between">
      
      {/* Search Input bar */}
      <div className="w-96 relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search fleet, active trips, and driver profiles..."
          className="w-full bg-slate-900/60 border border-brand-border/80 focus:border-brand-accent rounded-lg py-2 pl-10 pr-4 text-xs font-semibold placeholder-slate-500 text-brand-title focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
        />
      </div>

      {/* Utilities Group */}
      <div className="flex items-center space-x-5">
        
        {/* Status Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/45 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Live</span>
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
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
            alt="User avatar"
            className="w-8.5 h-8.5 rounded-lg object-cover border border-slate-700 bg-slate-800"
          />
        </div>

      </div>

    </header>
  );
};

export default Navbar;
