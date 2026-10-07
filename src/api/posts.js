// Talks to the Sprint 10 DataStorm-API backend (the user's watchlist + reviews).
// Kept separate from tmdb.js, which still talks to TMDB for real movie catalog data.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handle(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchPosts() {
  const res = await fetch(`${API_BASE}/posts`);
  return handle(res);
}

export async function createPost(payload) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updatePost(id, payload) {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deletePost(id) {
  const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
  return handle(res);
}
