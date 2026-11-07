'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import {
  serviceScheduleService,
  ServiceSchedule,
  UpdateServiceScheduleRequest,
} from '@/services/serviceScheduleService';

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

// <input type="time"> trabaja en "HH:mm"; el backend devuelve "HH:mm:ss".
function toTimeInputValue(value: string): string {
  return value ? value.slice(0, 5) : '';
}

interface SegmentFormState {
  open_time: string;
  close_time: string;
}

interface DayFormState {
  is_closed: boolean;
  segments: SegmentFormState[];
}

interface ServiceSchedulesSectionProps {
  serviceId: string;
  schedules: ServiceSchedule[];
  onSaved: (schedules: ServiceSchedule[]) => void;
}

function buildInitialForms(
  schedules: ServiceSchedule[],
): Record<number, DayFormState> {
  const forms: Record<number, DayFormState> = {};
  DAY_NAMES.forEach((_, dayOfWeek) => {
    const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);
    forms[dayOfWeek] = {
      is_closed: schedule?.is_closed ?? false,
      segments:
        schedule && schedule.segments.length > 0
          ? schedule.segments.map((segment) => ({
              open_time: toTimeInputValue(segment.open_time),
              close_time: toTimeInputValue(segment.close_time),
            }))
          : [{ open_time: DEFAULT_OPEN_TIME, close_time: DEFAULT_CLOSE_TIME }],
    };
  });
  return forms;
}

export default function ServiceSchedulesSection({
  serviceId,
  schedules,
  onSaved,
}: ServiceSchedulesSectionProps) {
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

  const updateSegment = (
    segmentIndex: number,
    changes: Partial<SegmentFormState>,
  ) => {
    updateSelectedForm({
      segments: selectedForm.segments.map((segment, index) =>
        index === segmentIndex ? { ...segment, ...changes } : segment,
      ),
    });
  };

  const handleAddSegment = () => {
    updateSelectedForm({
      segments: [
        ...selectedForm.segments,
        { open_time: DEFAULT_OPEN_TIME, close_time: DEFAULT_CLOSE_TIME },
      ],
    });
  };

  const handleRemoveSegment = (segmentIndex: number) => {
    updateSelectedForm({
      segments: selectedForm.segments.filter(
        (_, index) => index !== segmentIndex,
      ),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const updated = await Promise.all(
        DAY_NAMES.map((_, dayOfWeek) => {
          const form = forms[dayOfWeek];
          const payload: UpdateServiceScheduleRequest = form.is_closed
            ? { is_closed: true, segments: [] }
            : {
                is_closed: false,
                segments: form.segments.map((segment) => ({
                  open_time: segment.open_time,
                  close_time: segment.close_time,
                })),
              };
          return serviceScheduleService.update(serviceId, dayOfWeek, payload);
        }),
      );
      onSaved(updated);
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
    <div className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-lg space-y-4">
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
          <h4 className="text-white font-medium text-sm">
            {DAY_NAMES[selectedDay]}
          </h4>
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
          <div className="space-y-3">
            {selectedForm.segments.map((segment, segmentIndex) => (
              <div key={segmentIndex} className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    htmlFor={`schedule-${serviceId}-${selectedDay}-${segmentIndex}-open`}
                    className="block text-xs text-neutral-500 mb-1"
                  >
                    Apertura
                  </label>
                  <input
                    id={`schedule-${serviceId}-${selectedDay}-${segmentIndex}-open`}
                    type="time"
                    value={segment.open_time}
                    onChange={(e) =>
                      updateSegment(segmentIndex, { open_time: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={`schedule-${serviceId}-${selectedDay}-${segmentIndex}-close`}
                    className="block text-xs text-neutral-500 mb-1"
                  >
                    Cierre
                  </label>
                  <input
                    id={`schedule-${serviceId}-${selectedDay}-${segmentIndex}-close`}
                    type="time"
                    value={segment.close_time}
                    onChange={(e) =>
                      updateSegment(segmentIndex, {
                        close_time: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSegment(segmentIndex)}
                  disabled={selectedForm.segments.length <= 1}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-3 rounded-lg border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSegment}
              className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1"
            >
              + Agregar rango horario
            </button>
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
