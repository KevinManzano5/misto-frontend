'use client';

import { FormEvent, useState } from 'react';
import { StoreCategory } from '@/services/storeCategoryService';

export interface ServiceFormValues {
  category_id: string;
  name: string;
  description: string;
  duration_minutes: string;
  price: string;
  min_lead_time_minutes: string;
}

export interface ServiceFormPayload {
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  min_lead_time_minutes: number;
}

interface ServiceFormProps {
  idPrefix: string;
  categories: StoreCategory[];
  initialValues: ServiceFormValues;
  submitLabel: string;
  savingLabel: string;
  saving: boolean;
  error: string;
  onSubmit: (payload: ServiceFormPayload) => void;
  onCancel: () => void;
}

export default function ServiceForm({
  idPrefix,
  categories,
  initialValues,
  submitLabel,
  savingLabel,
  saving,
  error,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormValues>(initialValues);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const durationMinutes = Number(form.duration_minutes);
    const price = Math.round(Number(form.price));
    const minLeadTimeMinutes = Number(form.min_lead_time_minutes);

    if (!form.category_id) {
      setValidationError('Selecciona una categoría.');
      return;
    }
    if (!form.name.trim()) {
      setValidationError('El nombre es obligatorio.');
      return;
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setValidationError('La duración debe ser un número mayor a 0.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setValidationError('El precio debe ser un número válido.');
      return;
    }
    if (!Number.isFinite(minLeadTimeMinutes) || minLeadTimeMinutes < 0) {
      setValidationError(
        'El tiempo mínimo de anticipación debe ser un número válido.',
      );
      return;
    }

    onSubmit({
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim(),
      duration_minutes: durationMinutes,
      price,
      min_lead_time_minutes: minLeadTimeMinutes,
    });
  };

  const displayError = validationError || error;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-neutral-800 rounded-lg p-4"
    >
      <div>
        <label
          htmlFor={`${idPrefix}-category`}
          className="block text-xs text-neutral-500 mb-1"
        >
          Categoría
        </label>
        <select
          id={`${idPrefix}-category`}
          value={form.category_id}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, category_id: e.target.value }))
          }
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-name`}
          className="block text-xs text-neutral-500 mb-1"
        >
          Nombre
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          name="name"
          placeholder="Nombre del servicio"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-description`}
          className="block text-xs text-neutral-500 mb-1"
        >
          Descripción
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          placeholder="Descripción del servicio"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={2}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`${idPrefix}-duration`}
            className="block text-xs text-neutral-500 mb-1"
          >
            Duración (min)
          </label>
          <input
            id={`${idPrefix}-duration`}
            type="number"
            name="duration_minutes"
            min="1"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                duration_minutes: e.target.value,
              }))
            }
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-price`}
            className="block text-xs text-neutral-500 mb-1"
          >
            Precio
          </label>
          <input
            id={`${idPrefix}-price`}
            type="number"
            name="price"
            min="0"
            step="1"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-min-lead-time`}
          className="block text-xs text-neutral-500 mb-1"
        >
          Anticipación mínima (min)
        </label>
        <input
          id={`${idPrefix}-min-lead-time`}
          type="number"
          name="min_lead_time_minutes"
          min="0"
          placeholder="0"
          value={form.min_lead_time_minutes}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              min_lead_time_minutes: e.target.value,
            }))
          }
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      {displayError && <p className="text-red-400 text-sm">{displayError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? savingLabel : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
