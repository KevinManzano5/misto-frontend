'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { storeService } from '@/services/storeService';

interface AdminStoreFeeCellProps {
  storeId: string;
  feePercentage: number;
  onUpdated: (storeId: string, feePercentage: number) => void;
}

export default function AdminStoreFeeCell({
  storeId,
  feePercentage,
  onUpdated,
}: AdminStoreFeeCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(feePercentage));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEditing = () => {
    setValue(String(feePercentage));
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setError('Debe ser un número entre 0 y 100.');
      return;
    }

    setSaving(true);
    try {
      const updated = await storeService.updateFee(storeId, {
        app_usage_fee_percentage: parsed,
      });
      onUpdated(storeId, updated.app_usage_fee_percentage);
      setEditing(false);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            'No se pudo actualizar la comisión en este momento.',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al actualizar la comisión.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="text-neutral-300 hover:text-white underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded"
      >
        {feePercentage}%
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex items-center gap-1.5">
      <label htmlFor={`fee-${storeId}`} className="sr-only">
        Porcentaje de comisión
      </label>
      <input
        id={`fee-${storeId}`}
        type="number"
        min={0}
        max={100}
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={saving}
        className="w-16 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={saving}
        className="px-2 py-1 rounded border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={cancelEditing}
        disabled={saving}
        className="px-2 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
      {error && (
        <span className="text-red-400 text-xs ml-1">{error}</span>
      )}
    </form>
  );
}
