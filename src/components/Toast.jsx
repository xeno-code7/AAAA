// src/components/Toast.jsx

import React, { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export function Toast({ message, type = "success", onClose, duration = 3000 }) {
  // Prevent crash on first load
  if (!message) return null;

  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, message]);

  // ✔ Missing object that previously crashed your app
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const iconStyles = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const Icon = icons[type] || icons.info;
  const currentStyle = styles[type] || styles.info;
  const currentIconStyle = iconStyles[type] || iconStyles.info;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slideDown">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${currentStyle} min-w-[300px] max-w-md`}
      >
        <Icon size={20} className={currentIconStyle} />
        <p className="flex-1 text-sm font-medium">{message}</p>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Toast;
