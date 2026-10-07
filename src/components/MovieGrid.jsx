import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

export default function MovieGrid({
  movies,
  watchlistIds,
  onToggleWatchlist,
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
            inWatchlist={watchlistIds.has(movie.id)}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
        {loading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)}
      </div>
      {showSentinel && <div ref={sentinelRef} className="sentinel" />}
    </>
  );
}
