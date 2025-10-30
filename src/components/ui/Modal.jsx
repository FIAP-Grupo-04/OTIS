import { useEffect } from "react";

/**
 * Componente Modal reutilizável
 *
 * Props:
 * - open (boolean): se o modal está visível
 * - onClose (function): chamada ao clicar fora ou pressionar Esc
 * - title (string): título exibido no cabeçalho
 * - children (ReactNode): conteúdo interno
 * - width (opcional): define largura máxima, padrão 760px
 */
export default function Modal({ open, onClose, title, children, width = 760 }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden"; // trava scroll
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ width: `min(${width}px, 92vw)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
