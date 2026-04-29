import { motion } from "motion/react";
import React from "react";
import { FaCopy, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

interface ShareModalProps {
  gardenId: string;
  onClose: () => void;
  collaborators: string[];
  onInvite: (uid: string) => Promise<void>;
  onRemove: (uid: string) => Promise<void>;
}

/**
 * Modal component for managing garden collaborators.
 * Allows adding and removing users with access to the garden.
 */
export default function ShareModal({
  gardenId,
  onClose,
  collaborators,
  onInvite,
  onRemove,
}: ShareModalProps) {
  const [inviteId, setInviteId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const copyGardenLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/garden/${gardenId}`);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Link copiado",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleInvite = async () => {
    if (inviteId.trim()) {
      setLoading(true);
      try {
        await onInvite(inviteId.trim());
        setInviteId("");
        Swal.fire("Sucesso", "Colaborador adicionado.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Não foi possível adicionar o colaborador.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="relative w-full max-w-md rounded-lg border border-rose-100 bg-white p-6 shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-2 text-stone-400 transition hover:bg-stone-50 hover:text-stone-600"
          title="Fechar"
        >
          <FaTimes />
        </button>
        <h3 className="mb-1 text-2xl font-semibold text-stone-950">Colaboradores</h3>
        <p className="mb-6 text-sm text-stone-500">Convide pessoas para esta coleção.</p>

        <div className="mb-8 space-y-4">
          <button
            type="button"
            onClick={copyGardenLink}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-100 p-3 font-bold text-rose-700 transition hover:bg-rose-50"
          >
            <FaCopy />
            Copiar link
          </button>

          <div className="flex gap-2">
            <input
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="Digite o ID do usuário..."
              className="min-w-0 flex-grow rounded-lg border border-stone-200 p-3 transition focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={loading || !inviteId.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-900 px-4 py-3 font-bold text-white transition hover:bg-rose-800 disabled:opacity-50"
            >
              <FaPlus />
              Convidar
            </button>
          </div>
        </div>

        <div className="custom-scrollbar max-h-60 space-y-3 overflow-y-auto">
          {collaborators.length > 0 ? (
            collaborators.map((uid) => (
              <div
                key={uid}
                className="group flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-900 text-xs font-bold text-white">
                    {uid.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="max-w-[150px] truncate text-sm font-medium text-stone-700">
                    {uid}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(uid)}
                  className="rounded-md p-2 text-red-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Remover"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-stone-400">
              Nenhum colaborador adicional ainda.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
