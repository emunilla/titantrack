import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-cyan-400" />,
    warning: <AlertTriangle size={20} className="text-amber-400" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-cyan-500/10 border-cyan-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 animate-fade-in panel-custom border ${bgColors[type]} p-4 rounded-xl shadow-2xl min-w-[300px] max-w-[400px]`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <p className="flex-1 text-xs font-bold text-bright uppercase tracking-tight">{message}</p>
        <button 
          onClick={onClose}
          className="text-dim hover:text-bright transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
