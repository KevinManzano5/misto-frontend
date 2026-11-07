'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  paymentMethodsService,
  PaymentMethodsConfig,
  UpdatePaymentMethodsRequest,
} from '@/services/paymentMethodsService';

type PaymentMethodKey = 'cash_on_site_enabled' | 'card_advance_enabled';

interface PaymentMethodToggleProps {
  id: PaymentMethodKey;
  label: string;
  enabled: boolean;
  onToggled: (key: PaymentMethodKey, enabled: boolean) => void;
}

function PaymentMethodToggle({
  id,
  label,
  enabled,
  onToggled,
}: PaymentMethodToggleProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    const next = !enabled;
    setSaving(true);
    setError('');

    try {
      const update: UpdatePaymentMethodsRequest = { [id]: next };
      const updated = await paymentMethodsService.update(update);
      onToggled(id, updated[id]);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            'No se pudo actualizar el método de pago en este momento.',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al actualizar el método de pago.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-white">{label}</span>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={saving}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled
            ? 'bg-green-600 border-green-600'
            : 'bg-neutral-800 border-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminPaymentMethodsSection() {
  const [config, setConfig] = useState<PaymentMethodsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await paymentMethodsService.get();
        if (cancelled) return;
        setConfig(data);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error al cargar los métodos de pago', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar los métodos de pago en este momento.',
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar los métodos de pago.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-neutral-500 animate-pulse">
          Cargando métodos de pago...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (!config) return null;

  const methods: { id: PaymentMethodKey; label: string }[] = [
    { id: 'cash_on_site_enabled', label: 'Efectivo al llegar' },
    { id: 'card_advance_enabled', label: 'Tarjeta por adelantado' },
  ];

  const handleToggled = (key: PaymentMethodKey, enabled: boolean) => {
    setConfig((prev) => (prev ? { ...prev, [key]: enabled } : prev));
  };

  return (
    <div>
      <div className="border border-neutral-800 rounded-xl divide-y divide-neutral-800">
        {methods.map((method) => (
          <PaymentMethodToggle
            key={method.id}
            id={method.id}
            label={method.label}
            enabled={config[method.id]}
            onToggled={handleToggled}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        Última actualización:{' '}
        {new Date(config.updated_at).toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
