'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-medium text-white tracking-tight"
        >
          {title}
        </h2>

        <p id="confirm-dialog-message" className="text-sm text-neutral-400">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {confirming ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
