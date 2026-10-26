'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { storeService } from '@/services/storeService';

export default function NewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const store = await storeService.create(formData);
      router.push(`/stores/${store.id}/settings`);
    } catch (err: unknown) {
      console.error('Error al crear la tienda', err);
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.detail || 'No se pudo crear la tienda.',
        );
      } else {
        setError('Ocurrió un error inesperado al crear la tienda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 font-sans px-4">
      <div className="max-w-md w-full p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl">
        <h2 className="text-2xl font-medium text-center text-white mb-8 tracking-tight">
          Crea tu tienda
        </h2>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nombre de tu tienda"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              placeholder="Describe tu tienda"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creando...' : 'Crear tienda'}
          </button>
        </form>
      </div>
    </div>
  );
}
