import Modal from "./Modal";

/**
 * Modal genérico para formulários de edição
 *
 * Props:
 * - open (bool)
 * - onClose (function)
 * - title (string)
 * - onSubmit (function)
 * - children (form fields)
 */
export default function EditModal({
  open,
  onClose,
  title,
  onSubmit,
  children,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={onSubmit}>
        <div className="form-grid">{children}</div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn primary">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}
