interface StarRatingProps {
  averageRating: number;
  ratingCount: number;
}

// Muestra el promedio de calificación y la cantidad de reseñas de una tienda.
export default function StarRating({
  averageRating,
  ratingCount,
}: StarRatingProps) {
  if (ratingCount === 0) {
    return (
      <p className="text-sm text-neutral-500 flex items-center gap-1">
        <StarIcon className="text-neutral-700" />
        Sin reseñas todavía
      </p>
    );
  }

  return (
    <p className="text-sm text-neutral-300 flex items-center gap-1.5">
      <StarIcon className="text-yellow-400" />
      <span className="font-medium text-white">
        {averageRating.toFixed(1)}
      </span>
      <span className="text-neutral-500">
        ({ratingCount} {ratingCount === 1 ? 'reseña' : 'reseñas'})
      </span>
    </p>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 ${className ?? ''}`}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.783.57-1.838-.196-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}
