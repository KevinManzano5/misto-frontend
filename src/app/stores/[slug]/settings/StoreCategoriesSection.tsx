'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  storeCategoryService,
  StoreCategory,
} from '@/services/storeCategoryService';
import { storeService, Store } from '@/services/storeService';

interface StoreCategoriesSectionProps {
  store: Store;
  onUpdated: (store: Store) => void;
}

export default function StoreCategoriesSection({
  store,
  onUpdated,
}: StoreCategoriesSectionProps) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    store.categories.map((category) => category.id),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await storeCategoryService.getAll();
        setCategories(data);
      } catch (err: unknown) {
        console.error('Error al cargar las categorías de tienda', err);
        if (isAxiosError(err)) {
          setLoadError(
            err.response?.data?.detail ||
              'No se pudieron cargar las categorías disponibles.',
          );
        } else {
          setLoadError('Ocurrió un error inesperado al cargar las categorías.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEdit = () => {
    setSelectedIds(store.categories.map((category) => category.id));
    setSaveError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setSelectedIds(store.categories.map((category) => category.id));
    setSaveError('');
    setEditing(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    try {
      const updatedCategories = await storeService.updateCategories(
        store.id,
        selectedIds,
      );
      onUpdated({ ...store, categories: updatedCategories });
      setEditing(false);
    } catch (err: unknown) {
      console.error('Error al asignar categorías a la tienda', err);
      if (isAxiosError(err)) {
        setSaveError(
          err.response?.data?.detail ||
            'No se pudieron guardar las categorías de la tienda.',
        );
      } else {
        setSaveError('Ocurrió un error inesperado al guardar las categorías.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-start gap-4">
        <h2 className="text-xl font-medium text-white tracking-tight">
          Categorías
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            disabled={loading || !!loadError}
            className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Editar
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-neutral-500 text-sm animate-pulse">
          Cargando categorías...
        </p>
      ) : loadError ? (
        <p className="text-red-400 text-sm">{loadError}</p>
      ) : !editing ? (
        store.categories.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            Esta tienda no tiene categorías asignadas.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {store.categories.map((category) => (
              <span
                key={category.id}
                className="text-xs text-neutral-300 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )
      ) : (
        <>
          {categories.length === 0 ? (
            <p className="text-neutral-500 text-sm">
              No hay categorías disponibles.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}

          {saveError && <p className="text-red-400 text-sm">{saveError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
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
        </>
      )}
    </div>
  );
}
