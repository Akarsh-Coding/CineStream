export default function RatingBadge({ value }) {
  const score = typeof value === "number" ? value.toFixed(1) : "--";
  return <div className="rating-badge">{score}</div>;
}
