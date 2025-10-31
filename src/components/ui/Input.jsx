export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  id,
  disabled,
  ...rest
}) {
  return (
    <input
      type={type}
      className="input"
      id={id || name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  );
}
