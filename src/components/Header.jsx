import { Film, Search, X } from "lucide-react";

export default function Header({ view, onChangeView, favoriteCount, query, onChangeQuery }) {
  return (
    <header className="header">
      <div className="header__top">
        <div className="brand">
          <Film size={20} strokeWidth={1.75} />
          <span>Cine&#8209;Stream</span>
        </div>
        <nav className="tabs">
          <button
            className={"tab" + (view === "discover" ? " tab--active" : "")}
            onClick={() => onChangeView("discover")}
          >
            Discover
          </button>
          <button
            className={"tab" + (view === "favorites" ? " tab--active" : "")}
            onClick={() => onChangeView("favorites")}
          >
            Favorites
            {favoriteCount > 0 && <span className="tab__count">{favoriteCount}</span>}
          </button>
        </nav>
      </div>

      {view === "discover" && (
        <div className="search-row">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={query}
            placeholder="Search for a movie&hellip;"
            onChange={(e) => onChangeQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => onChangeQuery("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      <div className="marquee" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </header>
  );
}
