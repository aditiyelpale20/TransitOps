import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl, 2xl
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Trick to center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div className={`inline-block w-full text-left align-middle transition-all transform bg-slate-900 border border-brand-border rounded-xl shadow-2xl ${sizeClasses[size]} ${className} sm:my-8`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
            <h3 className="text-base font-bold text-brand-title uppercase tracking-wide">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-brand-title transition-colors p-1.5 rounded-lg hover:bg-slate-800"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5.5">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Modal;
