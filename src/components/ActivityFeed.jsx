import { Star, Bookmark, Loader2, AlertTriangle } from "lucide-react";

export default function ActivityFeed({ posts, loading, error }) {
  if (loading) {
    return (
      <div className="loading-more">
        <Loader2 className="spin" size={18} /> Loading activity
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

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>No activity yet</p>
        <span>Reviews and watchlist entries will show up here.</span>
      </div>
    );
  }

  return (
    <ul className="activity-list">
      {posts.map((post) => (
        <li key={post._id} className="activity-item">
          <div className="activity-item__icon">
            {post.type === "review" ? <Star size={15} /> : <Bookmark size={15} />}
          </div>
          <div className="activity-item__body">
            <p className="activity-item__title">{post.movieTitle || "Untitled"}</p>
            {post.type === "review" && (
              <p className="activity-item__meta">
                {post.rating ? `${post.rating}/10 — ` : ""}
                {post.content || "No review text"}
              </p>
            )}
            {post.type === "watchlist" && (
              <p className="activity-item__meta">
                {post.status === "watched" ? "Watched" : "Want to watch"}
              </p>
            )}
            {post.type !== "review" && post.type !== "watchlist" && (
              <p className="activity-item__meta">
                {post.content || "Legacy post — predates the review/watchlist schema"}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
