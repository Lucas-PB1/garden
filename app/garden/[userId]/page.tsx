"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSharedGarden } from "@/hooks/useSharedGarden";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import SpecialDateCounter from "@/components/SpecialDateCounter";
import GardenPhotoCard from "@/components/GardenPhotoCard";
import SlideshowModal from "@/components/SlideshowModal";

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
    specialDate, 
    specialDateTitle, 
    lovePhrases,
    // Collaborator props
    isCollaborator,
    handleCollaborativeUpload,
    handleCollaborativeDelete,
    fileInputRef,
    uploading,
    deletingId
  } = useSharedGarden(userId, editKey);
  const [showSlideshow, setShowSlideshow] = useState(false);
  // Convert timestamp if needed, but the hook should handle it. 
  // Wait, hook returns what it gets. Let's make sure pass it correctly.
  // Actually hook returns what profile has.
  // The component handles Firestore Timestamp check.


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    );
  }
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      icon: 'success',
      title: 'Link Copiado!',
      text: 'Envie para alguém especial ver este jardim 🌻',
      confirmButtonColor: '#ec4899'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4 md:p-8 relative">
       {/* Decorative Background */}
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[80px] mix-blend-multiply"></div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center mb-12 relative z-10 gap-6">
        <div className="text-center md:text-left">
            <span className="text-pink-500 font-medium tracking-wider text-sm uppercase">Visitando</span>
            <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm">
             {gardenName}
            </h1>
            <p className="text-pink-800/60 font-medium mt-2 tracking-wide">Vendo {photos.length} belas memórias</p>
        </div>
        
        <div className="flex items-center gap-3">
             {photos.length > 0 && (
                <button
                    onClick={() => setShowSlideshow(true)}
                    className="relative z-50 px-5 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 border border-pink-200 flex items-center justify-center text-white hover:from-pink-500 hover:to-rose-500 transition shadow-lg animate-pulse-slow gap-2 font-medium"
                    title="Iniciar Apresentação"
                >
                    <span className="text-lg md:text-xl pl-1">▶️</span>
                    <span>Assistir</span>
                </button>
            )}

            <button 
                onClick={handleShare}
                className="px-6 py-3 rounded-full bg-white text-pink-600 font-medium shadow-sm border border-pink-100 hover:bg-pink-50 transition text-sm flex items-center gap-2 group"
                title="Compartilhar Link"
            >
                <span className="text-lg group-hover:scale-110 transition">🔗</span>
                <span className="hidden md:inline">Compartilhar</span>
            </button>
            <Link 
                href="/garden"
                className="px-6 py-3 rounded-full bg-white text-gray-800 font-medium shadow-sm border border-gray-100 hover:bg-gray-50 transition text-sm flex items-center gap-2"
            >
                <span>🏡</span> <span className="hidden md:inline">Crie Seu Próprio Jardim</span><span className="md:hidden">Criar</span>
            </Link>
        </div>
      </header>

      {/* Special Date Section */}
      {specialDate && (
          <SpecialDateCounter date={specialDate} title={specialDateTitle || "Data Especial"} />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCollaborativeUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Collaborator Upload Button */}
      {isCollaborator && (
         <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="fixed bottom-6 right-6 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/40 text-white flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition"
            title="Adicionar Foto como Colaborador"
         >
           {uploading ? (
               <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
           ) : (
               <span className="text-3xl pb-1">+</span>
           )}
         </button>
      )}

      <div className={`columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 relative z-10 mx-auto ${
        photos.length === 1 ? 'max-w-sm' : 
        photos.length === 2 ? 'max-w-2xl' : 
        photos.length === 3 ? 'max-w-5xl' : 'max-w-7xl'
      }`}>
        {photos.map((photo) => (
            <div key={photo.id} className="w-full">
                <GardenPhotoCard 
                    photo={photo} 
                    lovePhrases={lovePhrases}
                    isOwner={isCollaborator}
                    onDelete={handleCollaborativeDelete}
                    deletingId={deletingId}
                />
            </div>
        ))}
        
        {photos.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-400">
                <p className="text-xl font-serif italic text-pink-300">Este jardim está aguardando seu primeiro florescer.</p>
             </div>
        )}
      </div>
        {showSlideshow && (
          <SlideshowModal 
            photos={photos} 
            lovePhrases={lovePhrases || []} 
            onClose={() => setShowSlideshow(false)} 
          />
        )}
    </div>
  );
}
