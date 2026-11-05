import { copyToClipboard } from "@/lib/ui/clipboard";
import Swal, { dangerCustomClass } from "@/lib/ui/swal";
import { motion } from "motion/react";
import React from "react";
import { FaCopy, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

interface ShareModalProps {
  gardenId: string;
  ownerId: string;
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
  ownerId,
  onClose,
  collaborators,
  onInvite,
  onRemove,
}: ShareModalProps) {
  const [inviteId, setInviteId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const copyGardenLink = async () => {
    const copied = await copyToClipboard(`${window.location.origin}/garden/${gardenId}`);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: copied ? "success" : "error",
      title: copied ? "Link copiado" : "Não foi possível copiar o link",
      showConfirmButton: false,
      timer: 1800,
    });
  };

  const handleRemove = async (uid: string) => {
    const result = await Swal.fire({
      title: "Remover colaborador?",
      text: "Essa pessoa perde o acesso à coleção. As fotos enviadas por ela continuam aqui.",
      icon: "warning",
      showCancelButton: true,
      customClass: dangerCustomClass,
      confirmButtonText: "Remover",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    setRemovingId(uid);
    try {
      await onRemove(uid);
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Não foi possível remover o colaborador.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleInvite = async () => {
    const id = inviteId.trim();
    if (id === ownerId) {
      Swal.fire("Esse é você", "O dono já tem acesso à coleção.", "info");
      return;
    }
    if (collaborators.includes(id)) {
      Swal.fire("Já adicionado", "Essa pessoa já colabora nesta coleção.", "info");
      return;
    }
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
        <h3 className="mb-1 text-2xl font-semibold text-brand-ink">Colaboradores</h3>
        <p className="mb-6 text-sm text-stone-500">
          Peça para a pessoa copiar o ID dela no painel e cole aqui. O link só abre para quem foi
          convidado.
        </p>

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
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
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
                  onClick={() => handleRemove(uid)}
                  disabled={removingId === uid}
                  className="rounded-md p-2 text-red-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Remover"
                  aria-label="Remover colaborador"
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
