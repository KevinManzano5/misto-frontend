'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { DateTime } from 'luxon';
import { ratingService, Rating } from '@/services/ratingService';

interface StoreReviewsSectionProps {
  storeId: string;
}

export default function StoreReviewsSection({
  storeId,
}: StoreReviewsSectionProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchRatings = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await ratingService.getByStore(storeId, page);
        if (cancelled) return;

        setRatings(data.ratings);
        setTotalCount(data.total_count);
        setPageSize(data.page_size);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error al cargar las reseñas', err);

        if (isAxiosError(err)) {
          setError(
            err.response?.data?.detail || 'No se pudieron cargar las reseñas.',
          );
        } else {
          setError('Ocurrió un error inesperado al cargar las reseñas.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRatings();

    return () => {
      cancelled = true;
    };
  }, [storeId, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="mt-12 border-t border-neutral-800 pt-8">
      <h2 className="text-xl font-medium text-white mb-6 tracking-tight">
        Reseñas {totalCount > 0 && `(${totalCount})`}
      </h2>

      {loading ? (
        <p className="text-neutral-500 text-sm animate-pulse">
          Cargando reseñas...
        </p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : ratings.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          Esta tienda todavía no tiene reseñas.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <ReviewCard key={rating.id} rating={rating} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page <= 1}
                className="text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1"
              >
                ← Anterior
              </button>
              <span className="text-sm text-neutral-500">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
                className="text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded px-2 py-1"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReviewCard({ rating }: { rating: Rating }) {
  const fullName = `${rating.client_first_name} ${rating.client_last_name}`.trim();

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-xl">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <p className="text-white font-medium text-sm">
            {fullName || rating.client_username}
          </p>
          <p className="text-neutral-500 text-xs">@{rating.client_username}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon
              key={index}
              filled={index < rating.score}
              className={index < rating.score ? 'text-yellow-400' : 'text-neutral-700'}
            />
          ))}
        </div>
      </div>

      {rating.comment && (
        <p className="text-neutral-300 text-sm leading-relaxed mb-2">
          {rating.comment}
        </p>
      )}

      <p className="text-neutral-500 text-xs">
        {DateTime.fromISO(rating.created_at, { zone: 'utc' })
          .toLocal()
          .toFormat('dd/MM/yyyy')}
      </p>
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
      className={`w-4 h-4 ${className ?? ''}`}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.783.57-1.838-.196-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}
