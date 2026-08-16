import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cine-stream:favorites";

/**
 * Persists a "My Favorites" array to localStorage, synced on every change.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to read favorites from localStorage", err);
    }
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      const next = exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to persist favorites to localStorage", err);
      }
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
