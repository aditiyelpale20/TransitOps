import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = ''
}) => {
  return (
    <div className={`relative rounded-lg shadow-sm ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
        <FiSearch className="h-4.5 w-4.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-lg bg-slate-900 border border-slate-800 focus:border-brand-accent focus:ring-brand-accent text-brand-title placeholder-slate-500 text-sm py-2 px-3.5 pl-10.5 transition-all focus:outline-none focus:ring-1"
      />
    </div>
  );
};

export default SearchBar;
