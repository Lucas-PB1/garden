import type { GardenTheme } from "@/features/gardens/types";
import { motion } from "motion/react";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ThemeModalProps {
  onClose: () => void;
  currentTheme: GardenTheme;
  onSave: (theme: GardenTheme) => Promise<void>;
}

const THEME_OPTIONS: Array<{
  id: GardenTheme["bgType"];
  label: string;
  description: string;
  colors?: Pick<GardenTheme, "primaryColor" | "secondaryColor">;
}> = [
  {
    id: "floral",
    label: "Floral",
    description: "Claro e romântico",
    colors: { primaryColor: "#ec4899", secondaryColor: "#fbcfe8" },
  },
  {
    id: "stars",
    label: "Noite",
    description: "Escuro e íntimo",
    colors: { primaryColor: "#6366f1", secondaryColor: "#e0e7ff" },
  },
  {
    id: "minimalist",
    label: "Minimalista",
    description: "Limpo e discreto",
    colors: { primaryColor: "#10b981", secondaryColor: "#d1fae5" },
  },
  { id: "custom", label: "Customizado", description: "Sua imagem" },
];

/**
 * Modal for customizing the garden's aesthetic appearance.
 */
export default function ThemeModal({ onClose, currentTheme, onSave }: ThemeModalProps) {
  const [theme, setTheme] = useState<GardenTheme>(currentTheme);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(theme);
      onClose();
    } finally {
      setSaving(false);
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
        <h3 className="mb-1 text-2xl font-semibold text-stone-950">Personalizar jardim</h3>
        <p className="mb-6 text-sm text-stone-500">Ajuste o clima visual desta coleção.</p>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-bold text-stone-700">Estilo do fundo</label>
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => {
                    setTheme({
                      ...theme,
                      bgType: type.id,
                      ...type.colors,
                      customBgUrl: type.id === "custom" ? theme.customBgUrl : undefined,
                    });
                  }}
                  className={`rounded-lg border p-3 text-left transition ${
                    theme.bgType === type.id
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : "border-stone-200 text-stone-600 hover:border-rose-200"
                  }`}
                >
                  <span className="block text-sm font-bold">{type.label}</span>
                  <span className="mt-1 block text-xs text-stone-400">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {theme.bgType === "custom" && (
            <div>
              <label className="mb-2 block text-sm font-bold text-stone-700">URL da imagem</label>
              <input
                type="text"
                value={theme.customBgUrl || ""}
                onChange={(e) => setTheme({ ...theme, customBgUrl: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full rounded-lg border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-grow">
              <label className="mb-2 block text-sm font-bold text-stone-700">Cor primária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="h-10 w-full cursor-pointer rounded-lg border-none bg-transparent"
                />
                <span className="text-xs font-mono uppercase text-stone-400">
                  {theme.primaryColor}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <label className="mb-2 block text-sm font-bold text-stone-700">Cor secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                  className="h-10 w-full cursor-pointer rounded-lg border-none bg-transparent"
                />
                <span className="text-xs font-mono uppercase text-stone-400">
                  {theme.secondaryColor}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-rose-900 py-3.5 font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Estilo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
