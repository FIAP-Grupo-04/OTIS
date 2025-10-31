export default function Field({ label, error, children, required }) {
  return (
    <div className="field">
      {label && (
        <label className="label">
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>
          )}
        </label>
      )}
      {children}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
