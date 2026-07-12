import React from 'react';

const Loader = ({
  fullPage = false,
  message = 'Loading dashboard operations...'
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-accent animate-spin" />
      </div>
      {message && <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/95 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10 w-full">
      {spinner}
    </div>
  );
};

export default Loader;
