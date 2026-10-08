import { useState } from "react";
import { Bookmark, Check, Star, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { IMG_BASE } from "../api/tmdb";
import PosterFallback from "./PosterFallback";
import EmptyState from "./EmptyState";
import QuickAddForm from "./QuickAddForm";

function WatchlistEntry({ entry, isPending, onMarkWatched, onMarkWantToWatch, onRemove, onSubmitReview }) {
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
    } catch (err) {
      // already surfaced via the shared actionError banner above
    } finally {
      setSaving(false);
    }
  };

  const handleMarkWatched = () => onMarkWatched(entry._id).catch(() => {});
  const handleMarkWantToWatch = () => onMarkWantToWatch(entry._id).catch(() => {});
  const handleRemove = () => onRemove(entry._id).catch(() => {});

  const busy = isPending || saving;

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
          <button className="watch-entry__primary" onClick={handleMarkWatched} disabled={busy}>
            <Check size={14} /> {isPending ? "Updating\u2026" : "Mark as watched"}
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
                disabled={busy}
              />
            </label>
            <textarea
              rows={2}
              placeholder="Add a review\u2026"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={busy}
            />
            <button type="submit" className="watch-entry__primary" disabled={busy}>
              {busy ? "Saving\u2026" : entry.content || entry.rating ? "Update review" : "Save review"}
            </button>
          </form>
        )}

        <div className="watch-entry__footer">
          {entry.status === "watched" && (
            <button className="watch-entry__link" onClick={handleMarkWantToWatch} disabled={busy}>
              Move back to Want to Watch
            </button>
          )}
          <button
            className="watch-entry__link watch-entry__link--danger"
            onClick={handleRemove}
            disabled={busy}
          >
            <Trash2 size={13} /> {isPending ? "Removing\u2026" : "Remove"}
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
  actionError,
  pendingIds,
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

  const actionErrorBanner = actionError && (
    <div className="banner banner--error">
      <AlertTriangle size={16} /> {actionError}
    </div>
  );

  if (watchlist.length === 0) {
    return (
      <div className="watchlist">
        {actionErrorBanner}
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
      {actionErrorBanner}
      <QuickAddForm onAdd={onAdd} />

      {wantToWatch.length > 0 && (
        <section className="watchlist__section">
          <h3 className="watchlist__heading">Want to Watch</h3>
          <div className="watchlist__list">
            {wantToWatch.map((entry) => (
              <WatchlistEntry
                key={entry._id}
                entry={entry}
                isPending={pendingIds.has(entry._id)}
                {...shared}
              />
            ))}
          </div>
        </section>
      )}

      {watched.length > 0 && (
        <section className="watchlist__section">
          <h3 className="watchlist__heading">Watched</h3>
          <div className="watchlist__list">
            {watched.map((entry) => (
              <WatchlistEntry
                key={entry._id}
                entry={entry}
                isPending={pendingIds.has(entry._id)}
                {...shared}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
