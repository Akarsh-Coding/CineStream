import { useState } from "react";
import { Film, Key, AlertTriangle } from "lucide-react";

export default function ApiKeyGate({ onSubmit, error, checking }) {
  const [input, setInput] = useState("");

  return (
    <div className="gate">
      <div className="gate__card">
        <div className="gate__mark">
          <Film size={26} strokeWidth={1.5} />
        </div>
        <h1 className="gate__title">Cine&#8209;Stream</h1>
        <p className="gate__sub">Enter a TMDB API key (v3) to open the box office.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) onSubmit(input.trim());
          }}
        >
          <div className="gate__input-row">
            <Key size={16} className="gate__input-icon" />
            <input
              type="text"
              placeholder="Paste your TMDB API key"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="gate__error">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
          <button type="submit" className="gate__submit" disabled={!input.trim() || checking}>
            {checking ? "Checking\u2026" : "Roll film"}
          </button>
        </form>
        <p className="gate__hint">
          Get a free key at developer.themoviedb.org, or set <code>VITE_TMDB_API_KEY</code> in a{" "}
          <code>.env</code> file to skip this screen. Keys entered here are stored only in this
          browser's localStorage.
        </p>
      </div>
    </div>
  );
}
