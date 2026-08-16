import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Heart, Search, AlertTriangle, Loader2 } from "lucide-react";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import EmptyState from "./components/EmptyState";
import ApiKeyGate from "./components/ApiKeyGate";
import { fetchMovies, verifyApiKey } from "./api/tmdb";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useFavorites } from "./hooks/useFavorites";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import "./App.css";

const ENV_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const STORED_KEY_NAME = "cine-stream:tmdb-api-key";

export default function App() {
  const [apiKey, setApiKey] = useState(ENV_API_KEY || null);
  const [keyChecking, setKeyChecking] = useState(false);
  const [keyError, setKeyError] = useState("");

  const [view, setView] = useState("discover"); // discover | favorites
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 500);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const { favorites, toggleFavorite } = useFavorites();
  const requestIdRef = useRef(0);

  // If no env key was baked in at build time, fall back to a saved one.
  useEffect(() => {
    if (apiKey) return;
    try {
      const saved = localStorage.getItem(STORED_KEY_NAME);
      if (saved) setApiKey(saved);
    } catch (err) {
      console.error("Failed to read saved API key", err);
    }
  }, [apiKey]);

  const handleSaveKey = async (key) => {
    setKeyError("");
    setKeyChecking(true);
    try {
      await verifyApiKey(key);
      localStorage.setItem(STORED_KEY_NAME, key);
      setApiKey(key);
    } catch (err) {
      setKeyError("That key was rejected by TMDB. Double check it and try again.");
    } finally {
      setKeyChecking(false);
    }
  };

  const loadPage = useCallback(
    async (pageNum, q) => {
      if (!apiKey) return;
      const myRequestId = ++requestIdRef.current;
      const isFirstPage = pageNum === 1;
      isFirstPage ? setLoading(true) : setLoadingMore(true);
      setError("");
      try {
        const data = await fetchMovies({ apiKey, page: pageNum, query: q });
        if (myRequestId !== requestIdRef.current) return; // a newer request superseded this one
        setMovies((prev) => (isFirstPage ? data.results : [...prev, ...data.results]));
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (err) {
        if (myRequestId === requestIdRef.current) {
          setError("Couldn't reach TMDB. Check your connection or API key.");
        }
      } finally {
        if (myRequestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [apiKey]
  );

  // Whenever the debounced search term (or view) changes, reset to page 1.
  useEffect(() => {
    if (!apiKey || view !== "discover") return;
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    loadPage(1, debouncedQuery.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, apiKey, view]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || page >= totalPages) return;
    loadPage(page + 1, debouncedQuery.trim());
  }, [loading, loadingMore, page, totalPages, debouncedQuery, loadPage]);

  const sentinelRef = useInfiniteScroll({
    onIntersect: handleLoadMore,
    enabled: view === "discover",
  });

  const favoriteIds = useMemo(() => new Set(favorites.map((m) => m.id)), [favorites]);
  const listToShow = view === "favorites" ? favorites : movies;
  const headline =
    view === "favorites"
      ? "My favorites"
      : debouncedQuery.trim()
      ? `Results for "${debouncedQuery.trim()}"`
      : "Now trending";

  if (!apiKey) {
    return <ApiKeyGate onSubmit={handleSaveKey} error={keyError} checking={keyChecking} />;
  }

  return (
    <div className="app">
      <Header
        view={view}
        onChangeView={setView}
        favoriteCount={favorites.length}
        query={query}
        onChangeQuery={setQuery}
      />

      <main className="main">
        <h2 className="headline">{headline}</h2>

        {error && (
          <div className="banner banner--error">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {view === "favorites" && favorites.length === 0 && (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            subtitle="Tap the heart on any poster in Discover to save it here."
          />
        )}

        {view === "discover" && !loading && movies.length === 0 && !error && (
          <EmptyState icon={Search} title="Nothing found" subtitle="Try a different title." />
        )}

        <MovieGrid
          movies={listToShow}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          loading={view === "discover" && loading}
          sentinelRef={sentinelRef}
          showSentinel={view === "discover"}
        />

        {loadingMore && (
          <div className="loading-more">
            <Loader2 className="spin" size={18} /> Loading more
          </div>
        )}

        {view === "discover" && !loading && !loadingMore && movies.length > 0 && page >= totalPages && (
          <p className="end-of-reel">&mdash; end of reel &mdash;</p>
        )}
      </main>
    </div>
  );
}
