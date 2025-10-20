/**
 * Select: dropdown estilizado com classes do forms.css
 * Aceita props:
 * - value
 * - onChange
 * - options: [{ id, nome }] ou array de strings
 * - placeholder (opcional)
 */
export default function Select({ value, onChange, options = [], placeholder }) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { id: o, nome: o } : o
  );

  return (
    <select className="input select" value={value} onChange={onChange}>
      {placeholder && <option value="">{placeholder}</option>}
      {normalized.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.nome}
        </option>
      ))}
    </select>
  );
}
