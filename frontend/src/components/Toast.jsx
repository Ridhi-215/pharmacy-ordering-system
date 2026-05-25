import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/95 border border-emerald-200 text-emerald-800 shadow-emerald-100',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
        };
      case 'error':
        return {
          bg: 'bg-rose-50/95 border border-rose-200 text-rose-800 shadow-rose-100',
          icon: <XCircle className="w-5 h-5 text-rose-500" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/95 border border-amber-200 text-amber-800 shadow-amber-100',
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50/95 border border-blue-200 text-blue-800 shadow-blue-100',
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.02] ${styles.bg}`}
              style={{
                animation: 'slideIn 0.3s ease-out forwards'
              }}
            >
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-grow text-sm font-medium tracking-wide pr-2">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Embedded slide-in animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
