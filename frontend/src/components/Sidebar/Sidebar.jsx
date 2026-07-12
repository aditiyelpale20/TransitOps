import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiTruck, 
  FiUsers, 
  FiCompass, 
  FiCheckSquare, 
  FiFileText, 
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiTrendingUp,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Fleet', path: '/vehicles', icon: FiTruck },
    { name: 'Drivers', path: '/drivers', icon: FiUsers },
    { name: 'Trips', path: '/trips', icon: FiCompass },
    { name: 'Maintenance', path: '/maintenance', icon: FiCheckSquare },
    { name: 'Fuel & Expenses', path: '/fuel-expenses', icon: FiTrendingUp },
    { name: 'Analytics', path: '/reports', icon: FiFileText },
    { name: 'Settings', path: '/settings', icon: FiSettings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 bg-brand-dark border-r border-brand-border flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-brand-border">
          <div className={`flex items-center space-x-2.5 overflow-hidden transition-all duration-300 ${isCollapsed ? 'scale-0 w-0' : 'scale-100 w-auto'}`}>
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center font-black text-brand-dark text-lg shadow-md shadow-brand-accent/20">
              T
            </div>
            <div>
              <span className="text-sm font-black text-slate-100 tracking-wider">
                TransitOps
              </span>
              <p className="text-[8px] font-bold text-brand-accent tracking-widest uppercase -mt-0.5">
                Mission Control
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg border border-brand-border text-slate-400 hover:text-brand-title hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <FiChevronRight className="h-4.5 w-4.5" /> : <FiChevronLeft className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3.5 px-3.5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-900 border-l-2 border-brand-accent text-brand-accent shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={`transition-all duration-200 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile Card */}
      <div className="p-4 border-t border-brand-border space-y-2">
        <div className={`flex items-center space-x-3 bg-slate-900/40 border border-brand-border/60 rounded-xl p-3 overflow-hidden ${
          isCollapsed ? 'justify-center p-2' : ''
        }`}>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
            alt="profile"
            className="w-9 h-9 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-200 truncate uppercase tracking-wide">
                {user?.name || "Alex Rivera"}
              </h4>
              <p className="text-[9px] text-slate-500 font-semibold truncate uppercase tracking-widest mt-0.5">
                {user?.role || "Fleet Director"}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 w-full px-3.5 py-3 rounded-lg text-sm font-bold text-red-400/90 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-950/30 uppercase tracking-wider transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FiLogOut className="h-5 w-5 shrink-0" />
          <span className={`overflow-hidden transition-all ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
