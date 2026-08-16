import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

export default function MovieGrid({
  movies,
  favoriteIds,
  onToggleFavorite,
  loading,
  sentinelRef,
  showSentinel,
}) {
  return (
    <>
      <div className="grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={favoriteIds.has(movie.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
        {loading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)}
      </div>
      {showSentinel && <div ref={sentinelRef} className="sentinel" />}
    </>
  );
}
