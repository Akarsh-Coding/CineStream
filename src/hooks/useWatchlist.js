import { useCallback, useEffect, useState } from "react";
import { fetchPosts, createPost, updatePost, deletePost } from "../api/posts";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPosts();
      setWatchlist(data);
    } catch (err) {
      setError("Couldn't reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // movie.id from TMDB vs. a stored entry's movieId
  const entryFor = useCallback(
    (movieId) => watchlist.find((p) => p.movieId === movieId),
    [watchlist]
  );

  const addToWatchlist = useCallback(async (movie) => {
    const created = await createPost({
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster_path || "",
      status: "want_to_watch",
    });
    setWatchlist((prev) => [created, ...prev]);
  }, []);

  const removeFromWatchlist = useCallback(async (postId) => {
    await deletePost(postId);
    setWatchlist((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const markAsWatched = useCallback(async (postId) => {
    const updated = await updatePost(postId, { status: "watched" });
    setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  }, []);

  const markAsWantToWatch = useCallback(async (postId) => {
    const updated = await updatePost(postId, { status: "want_to_watch" });
    setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  }, []);

  const submitReview = useCallback(async (postId, { rating, content }) => {
    const updated = await updatePost(postId, { rating, content });
    setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  }, []);

  return {
    watchlist,
    loading,
    error,
    entryFor,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    markAsWantToWatch,
    submitReview,
  };
}
