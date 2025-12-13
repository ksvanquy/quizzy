'use client';

import React, { ReactNode, createContext, useState, useCallback } from 'react';
import { getLogger } from '@/lib/logger/logger';

const logger = getLogger('ToastProvider');

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider
 * Manages global toast notifications
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id };

    logger.info('Toast added', {
      type: toast.type,
      message: toast.message,
    });

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration (default 3s)
    const duration = toast.duration ?? 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
function ToastContainer() {
  const context = React.useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, removeToast } = context;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg text-white max-w-md animate-fade-in-up ${getToastClass(
            toast.type
          )}`}
        >
          <div className="flex justify-between items-start">
            <p>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getToastClass(type: Toast['type']): string {
  const baseClass = 'bg-opacity-90';
  switch (type) {
    case 'success':
      return `bg-green-500 ${baseClass}`;
    case 'error':
      return `bg-red-500 ${baseClass}`;
    case 'warning':
      return `bg-yellow-500 ${baseClass}`;
    case 'info':
      return `bg-blue-500 ${baseClass}`;
    default:
      return `bg-gray-500 ${baseClass}`;
  }
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
