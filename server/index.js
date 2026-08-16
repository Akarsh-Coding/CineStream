import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

// falling back to a client-supplied one.
if (!TMDB_API_KEY) {
  console.error(
    "\nMissing TMDB_API_KEY.\n" +
      "Create server/.env (copy server/.env.example) and set TMDB_API_KEY=your_key\n" +
      "or set it as an environment variable on your host.\n"
  );
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5174;

async function tmdbGet(res, url) {
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.status_message || "TMDB request failed" });
    }
    res.json(data);
  } catch (err) {
    console.error("TMDB fetch failed:", err.message);
    res.status(502).json({ error: "Could not reach TMDB" });
  }
}

app.get("/api/movies/popular", (req, res) => {
  const page = req.query.page || "1";
  tmdbGet(res, `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
});

app.get("/api/movies/search", (req, res) => {
  const query = req.query.query || "";
  const page = req.query.page || "1";
  if (!query.trim()) return res.json({ results: [], page: 1, total_pages: 1 });
  tmdbGet(
    res,
    `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
});

// process handles both the API and the static site.
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Cine-Stream API server listening on http://localhost:${PORT}`);
});
