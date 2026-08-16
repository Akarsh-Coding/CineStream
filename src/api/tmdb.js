export const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export async function fetchMovies({ page, query }) {
  const url = query
    ? `/api/movies/search?query=${encodeURIComponent(query)}&page=${page}`
    : `/api/movies/popular?page=${page}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
  };
}
