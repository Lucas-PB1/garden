"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useSharedGarden } from "@/hooks/useSharedGarden";
import GardenPhotoCard from "@/components/GardenPhotoCard";
import SpecialDateCounter from "@/components/SpecialDateCounter";
import SlideshowModal from "@/components/SlideshowModal";
import GardenLayout from "@/components/GardenLayout";
import { GardenPhoto, GardenPhotoWithPhrase } from "@/services/gardenService";

export default function SharedGardenPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params.userId as string;
  const editKey = searchParams.get("key");

  // Auth Check for Collaborators
  useEffect(() => {
    if (editKey) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          const callbackUrl = encodeURIComponent(window.location.href);
          router.push(`/login?callbackUrl=${callbackUrl}`);
        }
      });
      return () => unsubscribe();
    }
  }, [editKey, router]);

  const {
    photos,
    loading,
    gardenName,
    isCollaborator,
    uploading,
    deletingId,
    fileInputRef,
    handleCollaborativeUpload,
    handleCollaborativeDelete,
    specialDate,
    specialDateTitle,
    lovePhrases
  } = useSharedGarden(userId, editKey);

  const [showSlideshow, setShowSlideshow] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <GardenLayout>
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm">
            {gardenName}
          </h1>
          <p className="text-pink-800/60 font-medium mt-2 tracking-wide">
            {isCollaborator ? "Você é um colaborador deste jardim" : "Visitando memórias especiais"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isCollaborator && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span><span>Plantando...</span></>
              ) : (
                <><span className="text-lg">🌸</span> Plantar Memória</>
              )}
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

      {specialDate && <SpecialDateCounter date={specialDate} title={specialDateTitle || "Data Especial"} />}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCollaborativeUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10 mx-auto max-w-7xl">
        {photos.map((photo: GardenPhotoWithPhrase) => (
          <GardenPhotoCard
            key={photo.id}
            photo={photo}
            phrase={photo.phrase}
            isOwner={isCollaborator}
            onDelete={(p: GardenPhoto) => handleCollaborativeDelete(p)}
            deletingId={deletingId || ""}
          />
        ))}
      </div>

      {isCollaborator && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/40 text-white flex items-center justify-center z-50"
        >
          <span className="text-2xl">+</span>
        </button>
      )}

      {showSlideshow && (
        <SlideshowModal
          photos={photos}
          lovePhrases={lovePhrases}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </GardenLayout>
  );
}
