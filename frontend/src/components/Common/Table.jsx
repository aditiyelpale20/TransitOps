import React from 'react';

const Table = ({
  headers = [],
  children,
  className = '',
  emptyMessage = 'No records found.'
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-brand-border bg-slate-900/40">
      <table className={`w-full min-w-[700px] border-collapse text-left text-sm text-brand-text ${className}`}>
        <thead className="bg-slate-900 border-b border-brand-border text-xs font-bold uppercase tracking-wider text-slate-400">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-5 py-3.5 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/60">
          {React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-slate-500 font-medium bg-slate-900/10">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
