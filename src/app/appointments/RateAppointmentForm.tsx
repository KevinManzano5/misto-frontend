'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { ratingService } from '@/services/ratingService';

interface RateAppointmentFormProps {
  appointmentId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RateAppointmentForm({
  appointmentId,
  onClose,
  onSubmitted,
}: RateAppointmentFormProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (score < 1) {
      setError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await ratingService.createForAppointment(appointmentId, {
        score,
        comment: comment.trim(),
      });
      onSubmitted();
    } catch (err: unknown) {
      console.error('Error al enviar la reseña', err);
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.detail || 'No se pudo enviar la reseña.',
        );
      } else {
        setError('Ocurrió un error inesperado al enviar la reseña.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-neutral-800 pt-3">
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          Calificación
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                aria-label={`${value} estrella${value === 1 ? '' : 's'}`}
                className="focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded"
              >
                <StarIcon
                  filled={value <= score}
                  className={value <= score ? 'text-yellow-400' : 'text-neutral-700'}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor={`rating-comment-${appointmentId}`}
          className="block text-sm text-neutral-400 mb-2"
        >
          Comentario (opcional)
        </label>
        <textarea
          id={`rating-comment-${appointmentId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia..."
          rows={2}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="text-sm bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enviando...' : 'Enviar reseña'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function StarIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={`w-6 h-6 ${className ?? ''}`}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.783.57-1.838-.196-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}
