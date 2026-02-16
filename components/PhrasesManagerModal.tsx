import { useState, useRef } from "react";

interface PhrasesManagerModalProps {
    phrases: string[];
    onSave: (newPhrases: string[]) => Promise<void>;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function PhrasesManagerModal({
    phrases,
    onSave,
    onImport,
    onClose,
    fileInputRef
}: PhrasesManagerModalProps) {
    const [localPhrases, setLocalPhrases] = useState<string[]>([...phrases]);
    const [newPhrase, setNewPhrase] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const handleAdd = () => {
        if (newPhrase.trim()) {
            setLocalPhrases([...localPhrases, newPhrase.trim()]);
            setNewPhrase("");
        }
    };

    const handleRemove = (index: number) => {
        setLocalPhrases(localPhrases.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, value: string) => {
        const updated = [...localPhrases];
        updated[index] = value;
        setLocalPhrases(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(localPhrases);
            onClose();
        } catch (error) {
            console.error("Failed to save phrases", error);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(localPhrases, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'frases_de_amor.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-pink-100 animate-fade-in-up">
                <div className="p-6 border-b border-pink-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-gray-800">Frases de Amor Hub</h3>
                        <p className="text-sm text-gray-500">Gerencie as mensagens que aparecem em suas memórias</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
                    {/* Phrases List */}
                    <div className="space-y-3">
                        {localPhrases.map((phrase, index) => (
                            <div key={index} className="flex gap-2 group animate-fade-in">
                                {editingIndex === index ? (
                                    <input
                                        autoFocus
                                        value={phrase}
                                        onChange={(e) => handleUpdate(index, e.target.value)}
                                        onBlur={() => setEditingIndex(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                                        className="flex-grow p-3 rounded-xl border-2 border-pink-200 outline-none focus:border-pink-400 bg-pink-50/30 text-gray-800 placeholder:text-gray-400 transition shadow-inner"
                                    />
                                ) : (
                                    <div
                                        onClick={() => setEditingIndex(index)}
                                        className="flex-grow p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-100 cursor-pointer transition flex items-center justify-between"
                                    >
                                        <span className="text-gray-700 text-sm italic">"{phrase}"</span>
                                        <span className="opacity-0 group-hover:opacity-100 text-pink-300 text-xs transition">✎ editar</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                    title="Remover frase"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}

                        {localPhrases.length === 0 && (
                            <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                                <span className="text-4xl block mb-2">📜</span>
                                <p>Nenhuma frase cadastrada ainda.</p>
                                <p className="text-xs">As imagens usarão legendas padrão.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-pink-50 bg-gray-50/50 rounded-b-3xl space-y-4">
                    {/* Add New */}
                    <div className="flex gap-2">
                        <input
                            placeholder="Adicione uma nova frase..."
                            value={newPhrase}
                            onChange={(e) => setNewPhrase(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className="flex-grow p-3 rounded-xl border border-gray-200 focus:border-pink-300 outline-none transition bg-white text-gray-800 placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleAdd}
                            className="px-6 py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 transition shadow-sm active:scale-95"
                        >
                            Adicionar
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 rounded-lg border border-pink-200 text-pink-500 text-xs font-bold hover:bg-pink-50 transition flex items-center gap-2"
                            >
                                📥 Importar JSON
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 rounded-lg border border-blue-200 text-blue-500 text-xs font-bold hover:bg-blue-50 transition flex items-center gap-2"
                            >
                                📤 Exportar / Exemplo
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
                            >
                                {saving ? "Salvando..." : "Salvar Mudanças"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
