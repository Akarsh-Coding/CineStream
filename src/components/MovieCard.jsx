import { Heart } from "lucide-react";
import { IMG_BASE } from "../api/tmdb";
import RatingBadge from "./RatingBadge";
import PosterFallback from "./PosterFallback";

export default function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  const year = (movie.release_date || "").slice(0, 4) || "\u2014";

  return (
    <div className="card">
      <div className="card__poster-wrap">
        {movie.poster_path ? (
          <img
            className="poster"
            src={`${IMG_BASE}${movie.poster_path}`}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <PosterFallback title={movie.title} />
        )}
        <RatingBadge value={movie.vote_average} />
        <button
          className={"heart-btn" + (isFavorite ? " heart-btn--active" : "")}
          onClick={() => onToggleFavorite(movie)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>
      <div className="card__perf" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="card__body">
        <p className="card__title" title={movie.title}>
          {movie.title}
        </p>
        <p className="card__year">{year}</p>
      </div>
    </div>
  );
}
