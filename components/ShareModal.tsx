interface ShareModalProps {
  onClose: () => void;
  onCopyView: () => void;
  onCopyEdit: () => void;
}

export default function ShareModal({ onClose, onCopyView, onCopyEdit }: ShareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 text-center">
          Compartilhar Jardim
        </h3>
        <p className="text-gray-500 text-sm text-center mb-6">
          Escolha como você quer convidar as pessoas.
        </p>

        <div className="space-y-4">
          <button
            onClick={onCopyView}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
              👀
            </div>
            <div>
              <p className="font-bold text-gray-700 group-hover:text-pink-600 transition">
                Apenas Visualizar
              </p>
              <p className="text-xs text-gray-400">As pessoas poderão ver, mas não tocar.</p>
            </div>
          </button>

          <button
            onClick={onCopyEdit}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <p className="font-bold text-gray-700 group-hover:text-pink-600 transition">
                Convidar Colaborador
              </p>
              <p className="text-xs text-gray-400">Permite adicionar e remover fotos.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
