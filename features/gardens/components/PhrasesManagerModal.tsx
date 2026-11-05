import Swal from "@/lib/ui/swal";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { FaDownload, FaPen, FaPlus, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { MAX_LOVE_PHRASE_LENGTH, MAX_LOVE_PHRASES, MAX_PHRASES_IMPORT_BYTES } from "../constants";
import { sanitizeLovePhrases } from "../utils/gardenValidation";

interface PhrasesManagerModalProps {
  phrases: string[];
  onSave: (newPhrases: string[]) => Promise<void>;
  onClose: () => void;
}

/**
 * Modal component for managing the collection of love phrases.
 * Supports manual entry, bulk JSON import/export, and inline editing/deletion.
 */
export default function PhrasesManagerModal({
  phrases,
  onSave,
  onClose,
}: PhrasesManagerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPhrases, setLocalPhrases] = useState<string[]>([...phrases]);
  const [newPhrase, setNewPhrase] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  /**
   * Adds a new phrase to the local collection.
   */
  const isFull = localPhrases.length >= MAX_LOVE_PHRASES;

  const handleAdd = () => {
    if (newPhrase.trim() && !isFull) {
      setLocalPhrases([...localPhrases, newPhrase.trim().slice(0, MAX_LOVE_PHRASE_LENGTH)]);
      setNewPhrase("");
    }
  };

  /**
   * Reads a JSON array of phrases into the local list. Nothing is persisted until "Salvar",
   * so the imported list is never overwritten by stale local state.
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_PHRASES_IMPORT_BYTES) {
      Swal.fire("Arquivo grande demais", "Envie um JSON de frases de até 256 KB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Not an array");

        const imported = sanitizeLovePhrases(parsed as string[]);
        if (imported.length === 0) throw new Error("Empty list");

        setLocalPhrases(imported);
        setEditingIndex(null);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `${imported.length} frases importadas. Clique em Salvar para aplicar.`,
          showConfirmButton: false,
          timer: 2600,
        });
      } catch {
        Swal.fire(
          "JSON inválido",
          'Use uma lista de textos, por exemplo: ["amo seu sorriso", "amo seu abraço"].',
          "error",
        );
      }
    };
    reader.readAsText(file);
  };

  /**
   * Removes a phrase from the local collection.
   * @param index - Index of the phrase to remove.
   */
  const handleRemove = (index: number) => {
    setLocalPhrases(localPhrases.filter((_, i) => i !== index));
  };

  /**
   * Updates an individual phrase in the local collection.
   * @param index - Index of the phrase to update.
   * @param value - New text value for the phrase.
   */
  const handleUpdate = (index: number, value: string) => {
    const updated = [...localPhrases];
    updated[index] = value;
    setLocalPhrases(updated);
  };

  /**
   * Saves the current local collection to the backend.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(sanitizeLovePhrases(localPhrases));
      onClose();
    } catch (error) {
      console.error("Failed to save phrases", error);
      Swal.fire("Erro", "Não foi possível salvar as frases.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Triggers a browser download of the current phrases collection in JSON format.
   */
  const handleExport = () => {
    const dataStr = JSON.stringify(localPhrases, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "frases_de_amor.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-rose-100 bg-white shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between border-b border-rose-100 p-6">
          <div>
            <h3 className="text-2xl font-semibold text-brand-ink">Frases</h3>
            <p className="text-sm text-stone-500">
              Mensagens exibidas junto às memórias · {localPhrases.length}/{MAX_LOVE_PHRASES}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
            title="Fechar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="custom-scrollbar flex-grow space-y-4 overflow-y-auto p-6">
          <div className="space-y-3">
            {localPhrases.map((phrase, index) => (
              <div key={index} className="group flex gap-2">
                {editingIndex === index ? (
                  <input
                    autoFocus
                    value={phrase}
                    maxLength={MAX_LOVE_PHRASE_LENGTH}
                    onChange={(e) => handleUpdate(index, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingIndex(null)}
                    className="flex-grow rounded-lg border border-rose-200 bg-rose-50/40 p-3 text-stone-800 shadow-inner transition placeholder:text-stone-400 focus:border-rose-400 focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => setEditingIndex(index)}
                    className="flex flex-grow cursor-pointer items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-3 transition hover:border-rose-100 hover:bg-rose-50"
                  >
                    <span className="text-sm italic text-stone-700">&quot;{phrase}&quot;</span>
                    <span className="text-xs text-rose-300 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <FaPen />
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded-lg p-3 text-red-300 transition hover:bg-red-50 hover:text-red-500"
                  title="Remover frase"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            {localPhrases.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-200 py-12 text-center text-stone-400">
                <p className="font-semibold text-stone-500">Nenhuma frase cadastrada ainda.</p>
                <p className="mt-1 text-xs">As imagens usarão apenas as legendas.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-rose-100 bg-stone-50/60 p-6">
          <div className="flex gap-2">
            <input
              placeholder={isFull ? "Limite de frases atingido" : "Adicione uma nova frase..."}
              maxLength={MAX_LOVE_PHRASE_LENGTH}
              disabled={isFull}
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-grow rounded-lg border border-stone-200 bg-white p-3 text-stone-800 transition placeholder:text-stone-400 focus:border-rose-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={isFull || !newPhrase.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-900 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPlus />
              Adicionar
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept="application/json,.json"
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-rose-100 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
              >
                <FaUpload />
                Importar JSON
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100"
              >
                <FaDownload />
                Exportar
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-5 py-3 font-bold text-stone-500 transition hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-rose-900 px-7 py-3 font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 disabled:opacity-70"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
