"use client";

import GardenLayout from "@/components/GardenLayout";
import GardenPhotoCard from "@/components/GardenPhotoCard";
import PhrasesManagerModal from "@/components/PhrasesManagerModal";
import ShareModal from "@/components/ShareModal";
import SlideshowModal from "@/components/SlideshowModal";
import SpecialDateCounter from "@/components/SpecialDateCounter";
import SpecialDateModal from "@/components/SpecialDateModal";
import ThemeModal from "@/components/ThemeModal";
import { useAuth } from "@/context/AuthContext";
import { useGarden } from "@/hooks/useGarden";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaPen } from "react-icons/fa";
import Link from "next/link";

/**
 * Unified Garden Page Component.
 * Supports multiple gardens per user and dynamic access control.
 */
export default function GardenPage() {
    const params = useParams();
    const gardenId = params.gardenId as string;
    const { user } = useAuth();

    const {
        loading,
        photos,
        uploading,
        loadingPhotos,
        deletingId,
        fileInputRef,
        gardenName,
        isEditingName,
        isOwner,
        isCollaborator,
        tempName,
        setTempName,
        handleFileSelect,
        handleDelete,
        startEditing,
        saveName,
        handleKeyDown,
        showShareModal,
        setShowShareModal,
        specialDate,
        specialDateTitle,
        showDateModal,
        setShowDateModal,
        handleSaveSpecialDate,
        lovePhrases,
        phrasesInputRef,
        handlePhrasesUpload,
        showPhrasesModal,
        setShowPhrasesModal,
        handleSavePhrases,
        updateTheme,
        garden,
        inviteCollaborator,
        removeCollaborator,
    } = useGarden(gardenId);

    const [showSlideshow, setShowSlideshow] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);

    if (loading || (!user && loadingPhotos)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
            </div>
        );
    }

    if (!user && !isCollaborator) return null;

    return (
        <GardenLayout theme={garden?.theme}>
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="text-center md:text-left">
                    <Link href="/dashboard" className="text-xs font-bold text-pink-400 hover:text-pink-600 mb-2 flex items-center gap-1 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Dashboard
                    </Link>

                    {isEditingName && isOwner ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={saveName}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="text-5xl font-serif font-bold text-gray-800 bg-transparent border-b-2 border-pink-400 focus:outline-none w-full max-w-md"
                            />
                            <button onClick={saveName} className="text-pink-500 hover:text-pink-600">
                                ✅
                            </button>
                        </div>
                    ) : (
                        <div className={`group flex items-center gap-3 ${isOwner ? 'cursor-pointer' : ''}`} onClick={isOwner ? startEditing : undefined}>
                            <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm group-hover:from-pink-500 group-hover:to-rose-500 transition">
                                {gardenName}
                            </h1>
                            {isOwner && (
                                <span className="opacity-0 group-hover:opacity-100 text-pink-300 transition-opacity text-xl">
                                    ✎
                                </span>
                            )}
                        </div>
                    )}
                    <p className="text-pink-800/60 font-medium mt-2 tracking-wide">
                        {isOwner ? "Cultivando belas memórias" : "Colaborando neste jardim"}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4">
                    {isOwner && (
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm text-pink-700 font-semibold shadow-sm border border-pink-100 hover:bg-white hover:shadow-pink-200/50 transition flex items-center gap-2 group"
                        >
                            <span className="group-hover:scale-110 transition">🔗</span> Compartilhar
                        </button>
                    )}

                    {isCollaborator && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Plantando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">🌸</span> Plantar Memória
                                </>
                            )}
                        </button>
                    )}

                    {isOwner && (
                        <button
                            onClick={() => setShowPhrasesModal(true)}
                            className="px-5 py-2.5 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-105 transition shadow-sm group gap-2 font-medium"
                        >
                            <span className="text-xl group-hover:rotate-12 transition">📜</span>
                            <span>Frases</span>
                        </button>
                    )}

                    {isOwner && (
                        <button
                            onClick={() => setShowThemeModal(true)}
                            className="px-5 py-2.5 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-105 transition shadow-sm group gap-2 font-medium"
                        >
                            <span className="text-xl group-hover:rotate-45 transition">🎨</span>
                            <span>Tema</span>
                        </button>
                    )}

                    {photos.length > 0 && (
                        <button
                            onClick={() => setShowSlideshow(true)}
                            className="px-5 py-2.5 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-105 transition shadow-sm group gap-2 font-medium"
                        >
                            <span className="text-xl pl-1 group-hover:scale-110 transition">▶️</span>
                            <span>Assistir</span>
                        </button>
                    )}
                </div>
            </header>

            {specialDate ? (
                <div className="relative group max-w-2xl mx-auto">
                    <SpecialDateCounter date={specialDate} title={specialDateTitle || "Data Especial"} />
                    {isOwner && (
                        <button
                            onClick={() => setShowDateModal(true)}
                            className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-pink-500 hover:bg-pink-100 hover:scale-110 transition shadow-sm opacity-0 group-hover:opacity-100"
                        >
                            <FaPen size={14} />
                        </button>
                    )}
                </div>
            ) : isOwner ? (
                <div
                    onClick={() => setShowDateModal(true)}
                    className="max-w-2xl mx-auto mb-12 p-6 rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/50 flex flex-col items-center justify-center text-pink-400 hover:bg-pink-100/50 transition cursor-pointer"
                >
                    <span className="text-3xl mb-2">📅</span>
                    <span className="font-bold">Adicionar Data Especial</span>
                    <span className="text-sm">Clique para o contador (ex: Aniversário)</span>
                </div>
            ) : null}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
            <input
                type="file"
                ref={phrasesInputRef}
                onChange={handlePhrasesUpload}
                accept="application/json"
                className="hidden"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10 mx-auto max-w-7xl">
                {photos.map((photo) => (
                    <GardenPhotoCard
                        key={photo.id}
                        photo={photo}
                        phrase={photo.phrase}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                        isOwner={isOwner || photo.uploadedBy === user?.uid}
                    />
                ))}

                {photos.length === 0 && !loadingPhotos && isCollaborator && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full max-w-sm aspect-[3/4] border-4 border-dashed border-pink-200 rounded-3xl flex flex-col items-center justify-center text-pink-300 hover:bg-pink-50/50 hover:border-pink-300 transition cursor-pointer gap-3 p-8 text-center"
                    >
                        <span className="text-5xl animate-bounce">🌻</span>
                        <span className="text-xl font-bold text-pink-400">Comece seu jardim</span>
                        <span className="text-sm text-pink-300">Cliquem e plantem sua primeira memória</span>
                    </div>
                )}
            </div>

            {isCollaborator && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/40 text-white flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition"
                >
                    <span className="text-2xl">+</span>
                </button>
            )}

            {showShareModal && isOwner && (
                <ShareModal
                    onClose={() => setShowShareModal(false)}
                    collaborators={garden?.collaboratorIds || []}
                    onInvite={inviteCollaborator}
                    onRemove={removeCollaborator}
                />
            )}

            {showDateModal && isOwner && (
                <SpecialDateModal
                    onClose={() => setShowDateModal(false)}
                    onSave={handleSaveSpecialDate}
                    currentDate={specialDate}
                    currentTitle={specialDateTitle}
                />
            )}

            {showSlideshow && (
                <SlideshowModal
                    photos={photos}
                    lovePhrases={lovePhrases}
                    theme={garden?.theme}
                    musicUrl={garden?.musicUrl}
                    onClose={() => setShowSlideshow(false)}
                />
            )}

            {showPhrasesModal && isOwner && (
                <PhrasesManagerModal
                    phrases={lovePhrases}
                    onSave={handleSavePhrases}
                    onClose={() => setShowPhrasesModal(false)}
                    fileInputRef={phrasesInputRef}
                />
            )}

            {showThemeModal && isOwner && garden && (
                <ThemeModal
                    onClose={() => setShowThemeModal(false)}
                    currentTheme={garden.theme}
                    onSave={updateTheme}
                />
            )}
        </GardenLayout>
    );
}
