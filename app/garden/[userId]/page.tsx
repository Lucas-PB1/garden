"use client";

import { useState } from "react";
import { useSharedGarden } from "@/hooks/useSharedGarden";
import Link from "next/link";
import { useParams } from "next/navigation";
import SpecialDateCounter from "@/components/SpecialDateCounter";
import GardenPhotoCard from "@/components/GardenPhotoCard";
import SlideshowModal from "@/components/SlideshowModal";

export default function SharedGardenPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const { photos, loading, gardenName, specialDate, specialDateTitle, lovePhrases } = useSharedGarden(userId);
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
                    className="px-5 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 border border-pink-200 flex items-center justify-center text-white hover:from-pink-500 hover:to-rose-500 transition shadow-lg animate-pulse-slow gap-2 font-medium"
                    title="Iniciar Apresentação"
                >
                    <span className="text-lg md:text-xl pl-1">▶️</span>
                    <span className="hidden md:inline">Assistir</span>
                </button>
            )}
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

      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 relative z-10 mx-auto max-w-7xl">
        {photos.map((photo) => (
            <GardenPhotoCard 
                key={photo.id}
                photo={photo} 
                lovePhrases={lovePhrases}
            />
        ))}
        
        {photos.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-400">
                <p className="text-xl font-serif italic text-pink-300">Este jardim está aguardando seu primeiro florescer.</p>
             </div>
        )}
      </div>
    </div>
  );
}
