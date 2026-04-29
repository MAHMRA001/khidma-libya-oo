import { Star } from "lucide-react";

export default function StarRating({ rating, onRate, size = "w-5 h-5", interactive = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}