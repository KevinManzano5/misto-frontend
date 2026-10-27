'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { storeService, Store, UpdateStoreRequest } from '@/services/storeService';

interface StoreInfoSectionProps {
  store: Store;
  onUpdated: (store: Store) => void;
}

interface InfoFormState {
  name: string;
  description: string;
  email: string;
  address: string;
  is_active: boolean;
}

function buildFormState(store: Store): InfoFormState {
  return {
    name: store.name,
    description: store.description,
    email: store.email,
    address: store.address,
    is_active: store.is_active,
  };
}

export default function StoreInfoSection({
  store,
  onUpdated,
}: StoreInfoSectionProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<InfoFormState>(() => buildFormState(store));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setForm(buildFormState(store));
    setError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(buildFormState(store));
    setError('');
    setEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload: UpdateStoreRequest = {
      name: form.name,
      description: form.description,
      email: form.email,
      address: form.address,
      is_active: form.is_active,
    };

    try {
      const updated = await storeService.update(store.id, payload);
      onUpdated(updated);
      setEditing(false);
    } catch (err: unknown) {
      console.error('Error al actualizar la información de la tienda', err);
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            'No se pudo actualizar la información de la tienda.',
        );
      } else {
        setError('Ocurrió un error inesperado al actualizar la tienda.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-6">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-xl font-medium text-white tracking-tight">
            Información
          </h2>
          <button
            type="button"
            onClick={handleEdit}
            className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1"
          >
            Editar
          </button>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Nombre</p>
          <p className="text-white">{store.name}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Descripción</p>
          <p className="text-neutral-300 leading-relaxed">
            {store.description || 'Sin descripción.'}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Correo</p>
          <p className="text-neutral-300">
            {store.email || 'Sin correo registrado.'}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Dirección</p>
          <p className="text-neutral-300">
            {store.address || 'Sin dirección registrada.'}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Estado</p>
          <p className="text-neutral-300">
            {store.is_active ? 'Activa' : 'Inactiva'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-6"
    >
      <h2 className="text-xl font-medium text-white tracking-tight">
        Información
      </h2>

      <div>
        <label
          htmlFor="store-name"
          className="block text-sm text-neutral-500 mb-1"
        >
          Nombre
        </label>
        <input
          id="store-name"
          name="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Nombre de la tienda"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label
          htmlFor="store-description"
          className="block text-sm text-neutral-500 mb-1"
        >
          Descripción
        </label>
        <textarea
          id="store-description"
          name="description"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Descripción de la tienda"
          rows={3}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500 resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="store-email"
          className="block text-sm text-neutral-500 mb-1"
        >
          Correo
        </label>
        <input
          id="store-email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="correo@ejemplo.com"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label
          htmlFor="store-address"
          className="block text-sm text-neutral-500 mb-1"
        >
          Dirección
        </label>
        <input
          id="store-address"
          name="address"
          type="text"
          value={form.address}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Dirección de la tienda"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white">Tienda activa</p>
          <p className="text-sm text-neutral-500">
            Las tiendas inactivas no aceptan nuevas citas.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.is_active}
          aria-label="Tienda activa"
          onClick={() =>
            setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
          }
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
            form.is_active ? 'bg-white' : 'bg-neutral-800'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
              form.is_active ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
            }`}
          />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
