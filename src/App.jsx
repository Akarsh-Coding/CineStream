import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import EmptyState from "./components/EmptyState";
import WatchlistView from "./components/WatchlistView";
import { fetchMovies } from "./api/tmdb";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useWatchlist } from "./hooks/useWatchlist";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import "./App.css";

export default function App() {
  const [view, setView] = useState("discover"); // discover | watchlist
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 500);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const {
    watchlist,
    loading: watchlistLoading,
    error: watchlistError,
    entryFor,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    markAsWantToWatch,
    submitReview,
  } = useWatchlist();

  const loadPage = useCallback(async (pageNum, q) => {
    const myRequestId = ++requestIdRef.current;
    const isFirstPage = pageNum === 1;
    isFirstPage ? setLoading(true) : setLoadingMore(true);
    setError("");
    try {
      const data = await fetchMovies({ page: pageNum, query: q });
      if (myRequestId !== requestIdRef.current) return; // a newer request superseded this one
      setMovies((prev) => (isFirstPage ? data.results : [...prev, ...data.results]));
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      if (myRequestId === requestIdRef.current) {
        setError("Couldn't reach the server. Is the backend running?");
      }
    } finally {
      if (myRequestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  // Whenever the debounced search term (or view) changes, reset to page 1.
  useEffect(() => {
    if (view !== "discover") return;
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    loadPage(1, debouncedQuery.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, view]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || page >= totalPages) return;
    loadPage(page + 1, debouncedQuery.trim());
  }, [loading, loadingMore, page, totalPages, debouncedQuery, loadPage]);

  const sentinelRef = useInfiniteScroll({
    onIntersect: handleLoadMore,
    enabled: view === "discover",
  });

  const watchlistIds = useMemo(() => new Set(watchlist.map((p) => p.movieId)), [watchlist]);

  const handleToggleWatchlist = useCallback(
    async (movie) => {
      try {
        const existing = entryFor(movie.id);
        if (existing) {
          await removeFromWatchlist(existing._id);
        } else {
          await addToWatchlist(movie);
        }
      } catch (err) {
        console.error("Failed to update watchlist:", err);
      }
    },
    [entryFor, addToWatchlist, removeFromWatchlist]
  );

  const headline =
    view === "watchlist"
      ? "My watchlist"
      : debouncedQuery.trim()
      ? `Results for "${debouncedQuery.trim()}"`
      : "Now trending";

  return (
    <div className="app">
      <Header
        view={view}
        onChangeView={setView}
        watchlistCount={watchlist.length}
        query={query}
        onChangeQuery={setQuery}
      />

      <main className="main">
        <h2 className="headline">{headline}</h2>

        {view === "discover" && error && (
          <div className="banner banner--error">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {view === "watchlist" ? (
          <WatchlistView
            watchlist={watchlist}
            loading={watchlistLoading}
            error={watchlistError}
            onMarkWatched={markAsWatched}
            onMarkWantToWatch={markAsWantToWatch}
            onRemove={removeFromWatchlist}
            onSubmitReview={submitReview}
          />
        ) : (
          <>
            {!loading && movies.length === 0 && !error && (
              <EmptyState icon={Search} title="Nothing found" subtitle="Try a different title." />
            )}

            <MovieGrid
              movies={movies}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
              loading={loading}
              sentinelRef={sentinelRef}
              showSentinel
            />

            {loadingMore && (
              <div className="loading-more">
                <Loader2 className="spin" size={18} /> Loading more
              </div>
            )}

            {!loading && !loadingMore && movies.length > 0 && page >= totalPages && (
              <p className="end-of-reel">&mdash; end of reel &mdash;</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
