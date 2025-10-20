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

/** Valida CPF apenas pelo formato (não faz o cálculo dos dígitos) */
export function isCPF(str) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(str);
}
