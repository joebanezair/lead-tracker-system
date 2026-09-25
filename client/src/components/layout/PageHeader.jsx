export default function PageHeader({ title, description, action }) {
  return (
    <header>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
