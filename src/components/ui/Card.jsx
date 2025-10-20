export default function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h4>{title}</h4>}
      {children}
    </div>
  );
}
