import { useCallback, useEffect, useState } from "react";
import { fetchPosts, createPost, createPostWithImage, updatePost, deletePost } from "../api/posts";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate from the initial-fetch error above: this covers POST/PUT/DELETE
  // failures on actions the user takes after the list has already loaded.
  const [actionError, setActionError] = useState("");
  // Post _ids with an update/delete currently in flight, so the UI can show
  // a per-item pending state instead of one global spinner.
  const [pendingIds, setPendingIds] = useState(new Set());

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

  const entryFor = useCallback(
    (movieId) => watchlist.find((p) => p.movieId === movieId),
    [watchlist]
  );

  // Shared wrapper for any mutation that targets an existing post by id:
  // marks it pending, clears/sets actionError, always clears pending after.
  const withPending = useCallback(async (id, fn, failureMessage) => {
    setActionError("");
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      return await fn();
    } catch (err) {
      setActionError(failureMessage);
      throw err; // let the caller (e.g. a form) know it failed too
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // imageFile is optional — present only when the quick-add form had a thumbnail attached.
  const addToWatchlist = useCallback(async (movie, imageFile) => {
    setActionError("");
    try {
      let created;
      if (imageFile) {
        const formData = new FormData();
        formData.append("movieId", movie.id);
        formData.append("movieTitle", movie.title);
        formData.append("status", "want_to_watch");
        formData.append("image", imageFile);
        created = await createPostWithImage(formData);
      } else {
        created = await createPost({
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path || "",
          status: "want_to_watch",
        });
      }
      setWatchlist((prev) => [created, ...prev]);
    } catch (err) {
      setActionError("Couldn't add that to your watchlist. Check your connection and try again.");
      throw err;
    }
  }, []);

  const removeFromWatchlist = useCallback(
    (postId) =>
      withPending(
        postId,
        async () => {
          await deletePost(postId);
          setWatchlist((prev) => prev.filter((p) => p._id !== postId));
        },
        "Couldn't remove that item. Check your connection and try again."
      ),
    [withPending]
  );

  const markAsWatched = useCallback(
    (postId) =>
      withPending(
        postId,
        async () => {
          const updated = await updatePost(postId, { status: "watched" });
          setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
        },
        "Couldn't update that item. Check your connection and try again."
      ),
    [withPending]
  );

  const markAsWantToWatch = useCallback(
    (postId) =>
      withPending(
        postId,
        async () => {
          const updated = await updatePost(postId, { status: "want_to_watch" });
          setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
        },
        "Couldn't update that item. Check your connection and try again."
      ),
    [withPending]
  );

  const submitReview = useCallback(
    (postId, { rating, content }) =>
      withPending(
        postId,
        async () => {
          const updated = await updatePost(postId, { rating, content });
          setWatchlist((prev) => prev.map((p) => (p._id === postId ? updated : p)));
        },
        "Couldn't save your review. Check your connection and try again."
      ),
    [withPending]
  );

  return {
    watchlist,
    loading,
    error,
    actionError,
    pendingIds,
    entryFor,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    markAsWantToWatch,
    submitReview,
  };
}
