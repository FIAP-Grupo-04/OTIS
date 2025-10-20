export default function Button({ children, loading, ...props }) {
  return (
    <button className="btn-primary" disabled={loading} {...props}>
      {loading ? "Processando..." : children}
    </button>
  );
}
