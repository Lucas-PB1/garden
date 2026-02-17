import React from "react";

interface ShareModalProps {
  onClose: () => void;
  collaborators: string[];
  onInvite: (uid: string) => Promise<void>;
  onRemove: (uid: string) => Promise<void>;
}

/**
 * Modal component for managing garden collaborators.
 * Allows adding and removing users with access to the garden.
 */
export default function ShareModal({ onClose, collaborators, onInvite, onRemove }: ShareModalProps) {
  const [inviteId, setInviteId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleInvite = async () => {
    if (inviteId.trim()) {
      setLoading(true);
      try {
        await onInvite(inviteId.trim());
        setInviteId("");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 text-center">
          Colaboradores
        </h3>
        <p className="text-gray-500 text-sm text-center mb-6">
          Adicione pessoas para plantarem memórias com você.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <input
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="Digite o ID do usuário..."
              className="flex-grow p-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
            />
            <button
              onClick={handleInvite}
              disabled={loading || !inviteId.trim()}
              className="px-4 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50 transition"
            >
              Convidar
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3 custom-scrollbar">
          {collaborators.length > 0 ? (
            collaborators.map((uid) => (
              <div key={uid} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-600">
                    {uid.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {uid}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(uid)}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  Remover
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm italic py-4">
              Nenhum colaborador adicional ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
