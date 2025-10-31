import Modal from "./Modal";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemName,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar exclusão" width={480}>
      <p style={{ marginBottom: 18 }}>
        Tem certeza que deseja excluir <b>{itemName}</b>?
      </p>
      <div className="actions">
        <button className="btn ghost" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn primary" onClick={onConfirm}>
          Excluir
        </button>
      </div>
    </Modal>
  );
}
