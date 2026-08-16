export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="empty-state">
      <Icon size={30} strokeWidth={1.5} />
      <p>{title}</p>
      <span>{subtitle}</span>
    </div>
  );
}
