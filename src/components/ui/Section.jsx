export default function Section({ title, subtitle, children }) {
  return (
    <div className="panel">
      {title && <h3 style={{ margin: "0 0 6px" }}>{title}</h3>}
      {subtitle && (
        <p className="subtitle" style={{ marginTop: 0 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
