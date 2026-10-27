'use client';

import { useState } from 'react';
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

const DEFAULT_OPEN_TIME = '09:00';
const DEFAULT_CLOSE_TIME = '18:00';

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
  schedules: StoreSchedule[];
}

function buildInitialForms(
  schedules: StoreSchedule[],
): Record<number, DayFormState> {
  const forms: Record<number, DayFormState> = {};
  DAY_NAMES.forEach((_, dayOfWeek) => {
    const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);
    forms[dayOfWeek] = {
      open_time: toTimeInputValue(schedule?.open_time ?? '') || DEFAULT_OPEN_TIME,
      close_time:
        toTimeInputValue(schedule?.close_time ?? '') || DEFAULT_CLOSE_TIME,
      is_closed: schedule?.is_closed ?? false,
    };
  });
  return forms;
}

export default function StoreSchedulesSection({
  storeId,
  schedules,
}: StoreSchedulesSectionProps) {
  const [forms, setForms] = useState<Record<number, DayFormState>>(() =>
    buildInitialForms(schedules),
  );
  const [selectedDay, setSelectedDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const selectedForm = forms[selectedDay];

  const updateSelectedForm = (changes: Partial<DayFormState>) => {
    setForms((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], ...changes },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await Promise.all(
        DAY_NAMES.map((_, dayOfWeek) => {
          const form = forms[dayOfWeek];
          const payload: UpdateStoreScheduleRequest = form.is_closed
            ? { open_time: '', close_time: '', is_closed: true }
            : {
                open_time: form.open_time,
                close_time: form.close_time,
                is_closed: false,
              };
          return storeScheduleService.update(storeId, dayOfWeek, payload);
        }),
      );
      setSaved(true);
    } catch (err: unknown) {
      console.error('Error al guardar los horarios', err);
      const message = isAxiosError(err)
        ? err.response?.data?.detail || 'No se pudo guardar el horario.'
        : 'Ocurrió un error inesperado al guardar el horario.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Día">
        {DAY_NAMES.map((dayName, dayOfWeek) => (
          <button
            key={dayOfWeek}
            type="button"
            role="tab"
            aria-selected={selectedDay === dayOfWeek}
            onClick={() => setSelectedDay(dayOfWeek)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
              selectedDay === dayOfWeek
                ? 'bg-white text-black'
                : forms[dayOfWeek].is_closed
                  ? 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {dayName.slice(0, 3)}
          </button>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-medium">{DAY_NAMES[selectedDay]}</h3>
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={selectedForm.is_closed}
              onChange={(e) =>
                updateSelectedForm({ is_closed: e.target.checked })
              }
              className="focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            Cerrado
          </label>
        </div>

        {!selectedForm.is_closed && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="schedule-open-time"
                className="block text-xs text-neutral-500 mb-1"
              >
                Apertura
              </label>
              <input
                id="schedule-open-time"
                type="time"
                value={selectedForm.open_time}
                onChange={(e) =>
                  updateSelectedForm({ open_time: e.target.value })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label
                htmlFor="schedule-close-time"
                className="block text-xs text-neutral-500 mb-1"
              >
                Cierre
              </label>
              <input
                id="schedule-close-time"
                type="time"
                value={selectedForm.close_time}
                onChange={(e) =>
                  updateSelectedForm({ close_time: e.target.value })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && <p className="text-green-400 text-sm">Horarios guardados.</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
