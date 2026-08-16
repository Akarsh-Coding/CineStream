const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p/w500";

/**
 * Verify an API key works by hitting a cheap endpoint.
 */
export async function verifyApiKey(key) {
  const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${key}&page=1`);
  if (!res.ok) throw new Error("TMDB rejected this API key.");
  return true;
}

/**
 * Fetch either the popular-movies feed or a search page, depending on
 * whether a query string is present.
 */
export async function fetchMovies({ apiKey, page, query }) {
  const url = query
    ? `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
    : `${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=${page}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status})`);
  }
  const data = await res.json();
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
  };
}
