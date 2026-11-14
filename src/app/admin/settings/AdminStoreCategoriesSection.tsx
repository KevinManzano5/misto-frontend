'use client';

import { FormEvent, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  storeCategoryService,
  StoreCategory,
} from '@/services/storeCategoryService';
import ConfirmDialog from './ConfirmDialog';
import { useToast, ToastContainer } from '@/components/Toast';

export default function AdminStoreCategoriesSection() {
  const { toasts, showToast, dismissToast } = useToast();

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<StoreCategory | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await storeCategoryService.getAll();
        if (cancelled) return;
        setCategories(data);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error al cargar las categorías de tienda', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar las categorías de tienda en este momento.',
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar las categorías.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const created = await storeCategoryService.create({ name, slug });
      setCategories((prev) => [...prev, created]);
      setName('');
      setSlug('');
      showToast('success', `Categoría "${created.name}" creada correctamente.`);
    } catch (err: unknown) {
      console.error('Error al crear la categoría de tienda', err);
      if (isAxiosError(err)) {
        showToast(
          'error',
          err.response?.data?.detail ||
            'No se pudo crear la categoría de tienda.',
        );
      } else if (err instanceof Error) {
        showToast('error', err.message);
      } else {
        showToast('error', 'Ocurrió un error inesperado al crear la categoría.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (category: StoreCategory) => {
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditingId(category.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setUpdating(true);

    try {
      const updated = await storeCategoryService.update(editingId, {
        name: editName,
        slug: editSlug,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? updated : c)),
      );
      setEditingId(null);
      showToast(
        'success',
        `Categoría "${updated.name}" actualizada correctamente.`,
      );
    } catch (err: unknown) {
      console.error('Error al actualizar la categoría de tienda', err);
      if (isAxiosError(err)) {
        showToast(
          'error',
          err.response?.data?.detail ||
            'No se pudo actualizar la categoría de tienda.',
        );
      } else if (err instanceof Error) {
        showToast('error', err.message);
      } else {
        showToast(
          'error',
          'Ocurrió un error inesperado al actualizar la categoría.',
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestDelete = (category: StoreCategory) => {
    setCategoryToDelete(category);
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);

    try {
      await storeCategoryService.delete(categoryToDelete.id);
      setCategories((prev) =>
        prev.filter((c) => c.id !== categoryToDelete.id),
      );
      showToast(
        'success',
        `Categoría "${categoryToDelete.name}" eliminada correctamente.`,
      );
      setCategoryToDelete(null);
    } catch (err: unknown) {
      console.error('Error al eliminar la categoría de tienda', err);
      if (isAxiosError(err)) {
        showToast(
          'error',
          err.response?.data?.detail ||
            'No se pudo eliminar la categoría de tienda.',
        );
      } else if (err instanceof Error) {
        showToast('error', err.message);
      } else {
        showToast(
          'error',
          'Ocurrió un error inesperado al eliminar la categoría.',
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="category-name"
            className="block text-xs text-neutral-500 mb-1"
          >
            Nombre
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Restaurant"
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="category-slug"
            className="block text-xs text-neutral-500 mb-1"
          >
            Slug
          </label>
          <input
            id="category-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="restaurant"
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creando...' : 'Crear categoría'}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-neutral-500 animate-pulse">
            Cargando categorías de tienda...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          No hay categorías de tienda disponibles.
        </p>
      ) : (
        <div className="border border-neutral-800 rounded-xl divide-y divide-neutral-800">
          {categories.map((category) =>
            editingId === category.id ? (
              <form
                key={category.id}
                onSubmit={handleUpdate}
                className="px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor={`edit-name-${category.id}`}
                    className="block text-xs text-neutral-500 mb-1"
                  >
                    Nombre
                  </label>
                  <input
                    id={`edit-name-${category.id}`}
                    name="name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={`edit-slug-${category.id}`}
                    className="block text-xs text-neutral-500 mb-1"
                  >
                    Slug
                  </label>
                  <input
                    id={`edit-slug-${category.id}`}
                    name="slug"
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={category.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-white">{category.name}</p>
                  <p className="text-xs text-neutral-500">{category.slug}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(category)}
                    disabled={deletingId === category.id}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {categoryToDelete && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Eliminar la categoría "${categoryToDelete.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          confirming={deletingId === categoryToDelete.id}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
