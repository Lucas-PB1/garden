import { GardenTheme } from "@/services/gardenService";
import React, { useState } from "react";

interface ThemeModalProps {
    onClose: () => void;
    currentTheme: GardenTheme;
    onSave: (theme: GardenTheme) => Promise<void>;
}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    ✕
                </button>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6 text-center">
                    Personalizar Jardim
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Estilo do Fundo</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'floral', label: '🌸 Floral' },
                                { id: 'stars', label: '✨ Estrelas' },
                                { id: 'minimalist', label: '🌿 Minimalista' },
                                { id: 'custom', label: '🖼️ Customizado' },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        let newColors = {};
                                        if (type.id === 'floral') newColors = { primaryColor: '#ec4899', secondaryColor: '#fbcfe8' };
                                        if (type.id === 'stars') newColors = { primaryColor: '#6366f1', secondaryColor: '#e0e7ff' };
                                        if (type.id === 'minimalist') newColors = { primaryColor: '#10b981', secondaryColor: '#d1fae5' };

                                        setTheme({ ...theme, bgType: type.id as any, ...newColors });
                                    }}
                                    className={`p-3 rounded-xl border-2 transition font-medium ${theme.bgType === type.id
                                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                                        : 'border-gray-100 hover:border-pink-200 text-gray-500'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {theme.bgType === 'custom' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">URL da Imagem</label>
                            <input
                                type="text"
                                value={theme.customBgUrl || ""}
                                onChange={(e) => setTheme({ ...theme, customBgUrl: e.target.value })}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="w-full p-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cor Primária</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                    className="w-full h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="text-xs font-mono text-gray-400 uppercase">{theme.primaryColor}</span>
                            </div>
                        </div>
                        <div className="flex-grow">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cor Secundária</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={theme.secondaryColor}
                                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                                    className="w-full h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="text-xs font-mono text-gray-400 uppercase">{theme.secondaryColor}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "Salvar Estilo"}
                    </button>
                </div>
            </div>
        </div>
    );
}
