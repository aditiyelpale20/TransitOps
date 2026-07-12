import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5.5 py-4 border-t border-brand-border bg-slate-900/40 gap-3">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Showing <span className="text-slate-300 font-bold">{totalItems === 0 ? 0 : startIdx}-{endIdx}</span> of <span className="text-slate-300 font-bold">{totalItems}</span> items
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
        >
          <FiChevronLeft className="h-4.5 w-4.5" />
        </button>
        
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                isCurrent 
                  ? 'bg-brand-accent text-brand-dark' 
                  : 'bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
        >
          <FiChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
