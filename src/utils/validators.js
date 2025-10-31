/** Verifica se todos os campos obrigatórios têm valor */
export function validateRequired(fields, form) {
  const errors = {};
  for (const key of fields) {
    if (!String(form[key] || "").trim()) {
      errors[key] = "Campo obrigatório.";
    }
  }
  return errors;
}

/** Valida formato básico de e-mail */
export function isEmail(str) {
  return /\S+@\S+\.\S+/.test(str);
}
