import { useState } from "react";
import { Bookmark, Check, Star, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { IMG_BASE } from "../api/tmdb";
import PosterFallback from "./PosterFallback";
import EmptyState from "./EmptyState";
import QuickAddForm from "./QuickAddForm";

function WatchlistEntry({ entry, onMarkWatched, onMarkWantToWatch, onRemove, onSubmitReview }) {
  const [rating, setRating] = useState(entry.rating ?? "");
  const [content, setContent] = useState(entry.content ?? "");
  const [saving, setSaving] = useState(false);

  const handleSaveReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmitReview(entry._id, {
        rating: rating === "" ? undefined : Number(rating),
        content,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="watch-entry">
      <div className="watch-entry__poster">
        {entry.moviePoster ? (
          <img src={`${IMG_BASE}${entry.moviePoster}`} alt={`${entry.movieTitle} poster`} loading="lazy" />
        ) : (
          <PosterFallback title={entry.movieTitle} />
        )}
      </div>

      <div className="watch-entry__body">
        <p className="watch-entry__title">{entry.movieTitle}</p>

        {entry.status === "want_to_watch" ? (
          <button className="watch-entry__primary" onClick={() => onMarkWatched(entry._id)}>
            <Check size={14} /> Mark as watched
          </button>
        ) : (
          <form className="review-form" onSubmit={handleSaveReview}>
            <label className="review-form__rating">
              <Star size={13} />
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="/10"
              />
            </label>
            <textarea
              rows={2}
              placeholder="Add a review\u2026"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit" className="watch-entry__primary" disabled={saving}>
              {saving ? "Saving\u2026" : entry.content || entry.rating ? "Update review" : "Save review"}
            </button>
          </form>
        )}

        <div className="watch-entry__footer">
          {entry.status === "watched" && (
            <button className="watch-entry__link" onClick={() => onMarkWantToWatch(entry._id)}>
              Move back to Want to Watch
            </button>
          )}
          <button
            className="watch-entry__link watch-entry__link--danger"
            onClick={() => onRemove(entry._id)}
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WatchlistView({
  watchlist,
  loading,
  error,
  onAdd,
  onMarkWatched,
  onMarkWantToWatch,
  onRemove,
  onSubmitReview,
}) {
  if (loading) {
    return (
      <div className="loading-more">
        <Loader2 className="spin" size={18} /> Loading your watchlist
      </div>
    );
  }

  if (error) {
    return (
      <div className="banner banner--error">
        <AlertTriangle size={16} /> {error}
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="watchlist">
        <QuickAddForm onAdd={onAdd} />
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          subtitle="Tap the bookmark on any poster in Discover, or add one by title above."
        />
      </div>
    );
  }

  const wantToWatch = watchlist.filter((p) => p.status !== "watched");
  const watched = watchlist.filter((p) => p.status === "watched");

  const shared = { onMarkWatched, onMarkWantToWatch, onRemove, onSubmitReview };

  return (
    <div className="watchlist">
      <QuickAddForm onAdd={onAdd} />

      {wantToWatch.length > 0 && (
        <section className="watchlist__section">
          <h3 className="watchlist__heading">Want to Watch</h3>
          <div className="watchlist__list">
            {wantToWatch.map((entry) => (
              <WatchlistEntry key={entry._id} entry={entry} {...shared} />
            ))}
          </div>
        </section>
      )}

      {watched.length > 0 && (
        <section className="watchlist__section">
          <h3 className="watchlist__heading">Watched</h3>
          <div className="watchlist__list">
            {watched.map((entry) => (
              <WatchlistEntry key={entry._id} entry={entry} {...shared} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
