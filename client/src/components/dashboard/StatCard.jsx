export default function StatCard({ icon: Icon, label, value }) {
  return (
    <article>
      <Icon />
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
    </article>
  );
}
