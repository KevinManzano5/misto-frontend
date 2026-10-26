'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  storeScheduleService,
  StoreSchedule,
  UpdateStoreScheduleRequest,
} from '@/services/storeScheduleService';

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

// <input type="time"> trabaja en "HH:mm"; el backend devuelve/espera "HH:mm:ss".
function toTimeInputValue(value: string): string {
  return value ? value.slice(0, 5) : '';
}

interface DayFormState {
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface StoreSchedulesSectionProps {
  storeId: string;
}

export default function StoreSchedulesSection({
  storeId,
}: StoreSchedulesSectionProps) {
  const [forms, setForms] = useState<Record<number, DayFormState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});
  const [savedDay, setSavedDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await storeScheduleService.getByStoreId(storeId);

        const initialForms: Record<number, DayFormState> = {};
        data.forEach((schedule: StoreSchedule) => {
          initialForms[schedule.day_of_week] = {
            open_time: toTimeInputValue(schedule.open_time),
            close_time: toTimeInputValue(schedule.close_time),
            is_closed: schedule.is_closed,
          };
        });
        setForms(initialForms);
      } catch (err: unknown) {
        console.error('Error al cargar los horarios', err);
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudieron cargar los horarios.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar los horarios.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [storeId]);

  const updateForm = (dayOfWeek: number, changes: Partial<DayFormState>) => {
    setForms((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...changes },
    }));
  };

  const handleSave = async (dayOfWeek: number) => {
    const form = forms[dayOfWeek];
    if (!form) return;

    setSavingDay(dayOfWeek);
    setSaveErrors((prev) => ({ ...prev, [dayOfWeek]: '' }));
    setSavedDay(null);

    const payload: UpdateStoreScheduleRequest = form.is_closed
      ? { open_time: '', close_time: '', is_closed: true }
      : {
          open_time: form.open_time,
          close_time: form.close_time,
          is_closed: false,
        };

    try {
      await storeScheduleService.update(storeId, dayOfWeek, payload);
      setSavedDay(dayOfWeek);
    } catch (err: unknown) {
      console.error('Error al guardar el horario', err);
      const message = isAxiosError(err)
        ? err.response?.data?.detail || 'No se pudo guardar el horario.'
        : 'Ocurrió un error inesperado al guardar el horario.';
      setSaveErrors((prev) => ({ ...prev, [dayOfWeek]: message }));
    } finally {
      setSavingDay(null);
    }
  };

  if (loading) {
    return (
      <p className="text-neutral-500 animate-pulse">Cargando horarios...</p>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {DAY_NAMES.map((dayName, dayOfWeek) => {
        const form = forms[dayOfWeek];
        if (!form) return null;

        return (
          <div
            key={dayOfWeek}
            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">{dayName}</h3>
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={form.is_closed}
                  onChange={(e) =>
                    updateForm(dayOfWeek, { is_closed: e.target.checked })
                  }
                  className="focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                Cerrado
              </label>
            </div>

            {!form.is_closed && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">
                    Apertura
                  </label>
                  <input
                    type="time"
                    value={form.open_time}
                    onChange={(e) =>
                      updateForm(dayOfWeek, { open_time: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">
                    Cierre
                  </label>
                  <input
                    type="time"
                    value={form.close_time}
                    onChange={(e) =>
                      updateForm(dayOfWeek, { close_time: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            )}

            {saveErrors[dayOfWeek] && (
              <p className="text-red-400 text-sm mb-3">
                {saveErrors[dayOfWeek]}
              </p>
            )}
            {savedDay === dayOfWeek && (
              <p className="text-green-400 text-sm mb-3">
                Horario guardado.
              </p>
            )}

            <button
              onClick={() => handleSave(dayOfWeek)}
              disabled={savingDay === dayOfWeek}
              className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingDay === dayOfWeek ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
