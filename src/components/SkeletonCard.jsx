export default function SkeletonCard() {
  return (
    <div className="card card--skeleton">
      <div className="poster poster--skeleton" />
      <div className="card__perf" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="card__body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--year" />
      </div>
    </div>
  );
}
