"use client";

import { useState } from "react";
import { useGarden } from "@/hooks/useGarden";
import SpecialDateCounter from "@/components/SpecialDateCounter";
import GardenPhotoCard from "@/components/GardenPhotoCard";
import SlideshowModal from "@/components/SlideshowModal";

export default function GardenPage() {
  const {
      user,
      loading,
      photos,
      uploading,
      loadingPhotos,
      deletingId,
      fileInputRef,
      shareText,
      gardenName,
      isEditingName,
      tempName,
      setTempName,
      handleFileSelect,
      handleDelete,
      handleShare,
      startEditing,

      saveName,
      handleKeyDown,
      showShareModal,
      setShowShareModal,
      copyViewLink,
      copyEditLink,
      specialDate,
      specialDateTitle,
      showDateModal,
      setShowDateModal,
      handleSaveSpecialDate,
      lovePhrases,
      phrasesInputRef,
      handlePhrasesUpload
  } = useGarden();

  const [showSlideshow, setShowSlideshow] = useState(false);

  if (loading || (!user && loadingPhotos)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4 md:p-8 relative">
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Watercolor Background */}
            <div className="absolute inset-0 bg-white"></div>
            <img 
                src="/bg/floral-bg.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-pink-50/30"></div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center mb-12 relative z-10 gap-6">
        <div className="text-center md:text-left">
            {isEditingName ? (
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
                    <button onClick={saveName} className="text-pink-500 hover:text-pink-600">✅</button>
                </div>
            ) : (
                <div className="group flex items-center gap-3 cursor-pointer" onClick={startEditing}>
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm group-hover:from-pink-500 group-hover:to-rose-500 transition">
                    {gardenName}
                    </h1>
                     <span className="opacity-0 group-hover:opacity-100 text-pink-300 transition-opacity text-xl">✎</span>
                </div>
            )}
            
            <p className="text-pink-800/60 font-medium mt-2 tracking-wide">Cultivando {photos.length} belas memórias</p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
            <button
                onClick={handleShare}
                className="px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm text-pink-700 font-semibold shadow-sm border border-pink-100 hover:bg-white hover:shadow-pink-200/50 transition flex items-center gap-2 group"
            >
                <span className="group-hover:scale-110 transition">🔗</span> {shareText}
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {uploading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin">Plantando...</span>
                    </>
                ) : (
                   <>
                    <span className="text-lg">🌸</span> Plantar Memória
                   </>
                )}
            </button>
            
            <button
                onClick={() => phrasesInputRef.current?.click()}
                className="px-5 py-2.5 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-105 transition shadow-sm group gap-2 font-medium"
                title="Carregar Frases de Amor"
            >
                <span className="text-xl group-hover:rotate-12 transition">📜</span>
                <span>Frases</span>
            </button>

            {photos.length > 0 && (
                <button
                    onClick={() => setShowSlideshow(true)}
                    className="px-5 py-2.5 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-105 transition shadow-sm group gap-2 font-medium"
                    title="Iniciar Apresentação"
                >
                     <span className="text-xl pl-1 group-hover:scale-110 transition">▶️</span>
                     <span>Assistir</span>
                </button>
            )}

           <LogoutButton />
        </div>
      </header>
      
      {/* Special Date Section - Editable */}
      <div className="relative group cursor-pointer" onClick={() => setShowDateModal(true)}>
          {specialDate ? (
               <SpecialDateCounter date={specialDate} title={specialDateTitle} />
          ) : (
              <div className="max-w-2xl mx-auto mb-12 p-6 rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/50 flex flex-col items-center justify-center text-pink-400 hover:bg-pink-100/50 transition">
                  <span className="text-3xl mb-2">📅</span>
                  <span className="font-bold">Adicionar Data Especial</span>
                  <span className="text-sm">Clique para adicionar um contador (ex: Aniversário)</span>
              </div>
          )}
          <div className="absolute top-2 right-1/2 translate-x-[200px] opacity-0 group-hover:opacity-100 transition text-pink-400 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm text-sm">
                ✎ Editar
          </div>
      </div>

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

      <div className="flex flex-wrap justify-center gap-6 relative z-10 mx-auto max-w-7xl">
        {photos.map((photo) => (
            <div key={photo.id} className="w-[calc(50%-0.75rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1.125rem)]">
                <GardenPhotoCard 
                    photo={photo} 
                    lovePhrases={lovePhrases}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    isOwner={true}
                />
            </div>
        ))}

        {photos.length === 0 && !loadingPhotos && (
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-sm aspect-[3/4] border-4 border-dashed border-pink-200 rounded-3xl flex flex-col items-center justify-center text-pink-300 hover:bg-pink-50/50 hover:border-pink-300 transition cursor-pointer gap-3 p-8 text-center"
             >
                <span className="text-5xl animate-bounce">🌻</span>
                <span className="text-xl font-bold text-pink-400">Comece seu jardim</span>
                <span className="text-sm text-pink-300">Clique para plantar sua primeira memória</span>
             </div>
        )}
      </div>
    
      <button
         onClick={() => fileInputRef.current?.click()}
         className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/40 text-white flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition"
      >
        <span className="text-2xl">+</span>
      </button>

      {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
                  <button 
                      onClick={() => setShowShareModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                      ✕
                  </button>
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 text-center">Compartilhar Jardim</h3>
                  <p className="text-gray-500 text-sm text-center mb-6">Escolha como você quer convidar as pessoas.</p>
                  
                  <div className="space-y-4">
                      <button 
                          onClick={copyViewLink}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition group text-left"
                      >
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">👀</div>
                          <div>
                              <p className="font-bold text-gray-700 group-hover:text-pink-600 transition">Apenas Visualizar</p>
                              <p className="text-xs text-gray-400">As pessoas poderão ver, mas não tocar.</p>
                          </div>
                      </button>

                      <button 
                          onClick={copyEditLink}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition group text-left"
                      >
                          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl">✨</div>
                          <div>
                              <p className="font-bold text-gray-700 group-hover:text-pink-600 transition">Convidar Colaborador</p>
                              <p className="text-xs text-gray-400">Permite adicionar e remover fotos.</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-pink-100 relative animate-fade-in-up">
                <button 
                    onClick={() => setShowDateModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    ✕
                </button>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6 text-center">Data Especial</h3>
                
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const dateVal = formData.get("date") as string;
                        const titleVal = formData.get("title") as string;
                        if (dateVal && titleVal) {
                             // Create date at noon to avoid timezone shift issues on simple dates
                             const dateObj = new Date(dateVal + "T12:00:00");
                             handleSaveSpecialDate(dateObj, titleVal);
                        }
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                        <input 
                            name="title"
                            defaultValue={specialDateTitle}
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
                            defaultValue={specialDate ? specialDate.toISOString().split('T')[0] : ""}
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
      )}

      {showSlideshow && (
          <SlideshowModal 
            photos={photos} 
            lovePhrases={lovePhrases} 
            onClose={() => setShowSlideshow(false)} 
          />
      )}

    </div>
  );
}

import { useAuth } from "@/context/AuthContext";

function LogoutButton() {
    const { logout } = useAuth();
    return (
        <button
            onClick={logout}
            className="w-12 h-12 rounded-full bg-white border border-pink-100 flex items-center justify-center text-pink-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition shadow-sm"
            title="Sair"
        >
             <span className="text-xl">🚪</span>
        </button>
    )
}
