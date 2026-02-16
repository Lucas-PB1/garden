interface SpecialDateModalProps {
  onClose: () => void;
  onSave: (date: Date, title: string) => void;
  currentDate?: Date | null;
  currentTitle?: string;
}

export default function SpecialDateModal({
  onClose,
  onSave,
  currentDate,
  currentTitle,
}: SpecialDateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6 text-center">
          Data Especial
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const dateVal = formData.get("date") as string;
            const titleVal = formData.get("title") as string;
            if (dateVal && titleVal) {
              const dateObj = new Date(dateVal + "T12:00:00");
              onSave(dateObj, titleVal);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
            <input
              name="title"
              defaultValue={currentTitle}
              placeholder="Ex: Nosso Namoro"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring focus:ring-pink-100 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
            <input
              type="date"
              name="date"
              defaultValue={currentDate ? currentDate.toISOString().split("T")[0] : ""}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring focus:ring-pink-100 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 mt-2"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
