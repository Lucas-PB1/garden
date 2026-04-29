import { motion } from "motion/react";
import { FaTimes } from "react-icons/fa";

interface SpecialDateModalProps {
  onClose: () => void;
  onSave: (date: Date, title: string) => void;
  currentDate?: Date | null;
  currentTitle?: string;
}

/**
 * Modal component for configuring the special anniversary or relationship date.
 * Captures both a custom title and a target date.
 */
export default function SpecialDateModal({
  onClose,
  onSave,
  currentDate,
  currentTitle,
}: SpecialDateModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-lg border border-rose-100 bg-white p-6 shadow-2xl"
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
        <h3 className="mb-1 text-2xl font-semibold text-stone-950">Data especial</h3>
        <p className="mb-6 text-sm text-stone-500">Defina um marco para a coleção.</p>

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
            <label className="mb-1 block text-sm font-bold text-stone-700">Título</label>
            <input
              name="title"
              defaultValue={currentTitle}
              placeholder="Ex: Nosso Namoro"
              className="w-full rounded-lg border border-stone-200 p-3 transition focus:border-rose-300 focus:outline-none focus:ring focus:ring-rose-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-700">Data</label>
            <input
              type="date"
              name="date"
              defaultValue={currentDate ? currentDate.toISOString().split("T")[0] : ""}
              className="w-full rounded-lg border border-stone-200 p-3 transition focus:border-rose-300 focus:outline-none focus:ring focus:ring-rose-100"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-rose-900 py-3 font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
          >
            Salvar
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
