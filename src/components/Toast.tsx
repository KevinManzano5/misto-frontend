'use client';

import { useCallback, useRef, useState } from 'react';

export interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const TOAST_DURATION_MS = 4000;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastItem['type'], message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  return { toasts, showToast, dismissToast };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-sm"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-950/90 border-green-900/50 text-green-400'
              : 'bg-red-950/90 border-red-900/50 text-red-400'
          }`}
        >
          <p>{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
            className="text-current opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
