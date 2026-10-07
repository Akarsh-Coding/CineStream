import express from "express";
import dns from "node:dns";
import https from "node:https";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const configuredCredential = process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY;
const isBearerToken =
  Boolean(process.env.TMDB_ACCESS_TOKEN) || configuredCredential?.split(".").length === 3;
const TMDB_ACCESS_TOKEN = isBearerToken
  ? configuredCredential.replace(/^Bearer\s+/i, "")
  : undefined;
const TMDB_API_KEY = isBearerToken ? undefined : configuredCredential;
const TMDB_BASE = "https://api.themoviedb.org/3";

// falling back to a client-supplied one.
if (!TMDB_ACCESS_TOKEN && !TMDB_API_KEY) {
  console.error(
    "\nMissing TMDB credentials.\n" +
      "Set TMDB_ACCESS_TOKEN or TMDB_API_KEY in server/.env\n" +
      "or set it as an environment variable on your host.\n"
  );
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5174;
dns.setServers(["1.1.1.1", "8.8.8.8"]);

function tmdbLookup(hostname, options, callback) {
  if (hostname !== "api.themoviedb.org") {
    callback(new Error(`Unexpected hostname in TMDB request: ${hostname}`));
    return;
  }

  dns.resolve4(hostname, (error, addresses) => {
    if (error) {
      callback(error);
    } else if (options.all) {
      callback(
        null,
        addresses.map((address) => ({ address, family: 4 }))
      );
    } else {
      callback(null, addresses[0], 4);
    }
  });
}

async function tmdbGet(res, endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  if (!TMDB_ACCESS_TOKEN) {
    url.searchParams.set("api_key", TMDB_API_KEY);
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const request = https.get(
        url,
        {
          lookup: tmdbLookup,
          headers: TMDB_ACCESS_TOKEN
            ? { accept: "application/json", Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
            : { accept: "application/json" },
        },
        (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          let result;
          try {
            result = JSON.parse(body);
          } catch (error) {
            reject(new Error("TMDB returned an invalid JSON response", { cause: error }));
            return;
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            const error = new Error(result?.status_message || "TMDB request failed");
            error.statusCode = response.statusCode;
            reject(error);
            return;
          }
          resolve(result);
        });
        response.on("error", reject);
        }
      );
      request.setTimeout(10000, () => request.destroy(new Error("TMDB request timed out")));
      request.on("error", reject);
    });
    res.json(data);
  } catch (err) {
    const cause = err.cause;
    console.error("TMDB fetch failed:", {
      message: err.message,
      cause: cause?.message,
      code: cause?.code,
    });
    res.status(err.statusCode || 502).json({ error: err.message || "Could not reach TMDB" });
  }
}

app.get("/api/movies/popular", (req, res) => {
  const page = String(req.query.page || "1");
  tmdbGet(res, "/movie/popular", { page });
});

app.get("/api/movies/search", (req, res) => {
  const query = String(req.query.query || "");
  const page = String(req.query.page || "1");
  if (!query.trim()) return res.json({ results: [], page: 1, total_pages: 1 });
  tmdbGet(res, "/search/movie", { query, page });
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
