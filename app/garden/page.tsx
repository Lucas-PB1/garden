"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getGardenPhotos, uploadPhoto, deletePhoto, GardenPhoto } from "@/services/gardenService";
import { compressImageToWebP } from "@/utils/imageUtils";

export default function GardenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareText, setShareText] = useState("Share Garden");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchPhotos() {
        if (user) {
            try {
                const data = await getGardenPhotos(user.uid);
                setPhotos(data);
            } catch (error) {
                console.error("Error fetching photos:", error);
            } finally {
                setLoadingPhotos(false);
            }
        }
    }
    fetchPhotos();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
        setUploading(true);
        try {
            const originalFile = e.target.files[0];
            
            // Validate type
            if (!originalFile.type.startsWith("image/")) {
                alert("Please upload a valid image file.");
                setUploading(false);
                return;
            }

            // Conver to WebP
            const webpFile = await compressImageToWebP(originalFile);

            // Use date string as default caption for now
            const caption = new Date().toLocaleDateString(); 
            await uploadPhoto(webpFile, user.uid, caption);
            
            // Refresh photos
            const updatedPhotos = await getGardenPhotos(user.uid);
            setPhotos(updatedPhotos);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload photo.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; 
        }
    }
  };

  const handleDelete = async (photo: GardenPhoto) => {
    if (confirm("Are you sure you want to prune this memory?")) {
        setDeletingId(photo.id);
        try {
            await deletePhoto(photo.id, photo.path);
            setPhotos(photos.filter(p => p.id !== photo.id));
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Could not delete photo.");
        } finally {
            setDeletingId(null);
        }
    }
  }

  const handleShare = () => {
    if (user) {
        const url = `${window.location.origin}/garden/${user.uid}`;
        navigator.clipboard.writeText(url);
        setShareText("Copied!");
        setTimeout(() => setShareText("Share Garden"), 2000);
    }
  };

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
        {/* Enhanced Decorative Background - MORE PINK */}
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[80px] mix-blend-multiply"></div>
            <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-fuchsia-200/20 rounded-full blur-[60px] mix-blend-multiply"></div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center mb-12 relative z-10 gap-6">
        <div className="text-center md:text-left">
            <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm">
            {user.displayName ? `${user.displayName}'s Garden` : "My Garden"}
            </h1>
            <p className="text-pink-800/60 font-medium mt-2 tracking-wide">Cultivating {photos.length} beautiful memories</p>
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
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Planting...
                    </>
                ) : (
                   <>
                    <span className="text-lg">�</span> Plant Memory
                   </>
                )}
            </button>
           <LogoutButton />
        </div>
      </header>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Enhanced Photo Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 relative z-10 mx-auto max-w-7xl">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] overflow-hidden group hover:shadow-[0_20px_50px_rgb(236,72,153,0.15)] transition duration-500 relative border border-pink-100/50"
          >
            <div className="relative">
                <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-auto block transition duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                />
                
                {/* Delete Button - Only visible on hover */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                    }}
                    disabled={deletingId === photo.id}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:scale-110 z-20"
                    title="Delete photo"
                >
                    {deletingId === photo.id ? (
                         <span className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    )}
                </button>

                {/* Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-5 pt-12 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                    <p className="text-white text-sm font-medium drop-shadow-md">{photo.caption}</p>
                </div>
            </div>
            
            {/* Cute bottom border for decoration */}
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300"></div>
          </div>
        ))}

         {/* Upload Placeholder if empty */}
        {photos.length === 0 && !loadingPhotos && (
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="break-inside-avoid aspect-[3/4] border-4 border-dashed border-pink-200 rounded-3xl flex flex-col items-center justify-center text-pink-300 hover:bg-pink-50/50 hover:border-pink-300 transition cursor-pointer gap-3 p-8 text-center"
             >
                <span className="text-5xl animate-bounce">🌻</span>
                <span className="text-xl font-bold text-pink-400">Start your garden</span>
                <span className="text-sm text-pink-300">Click to plant your first memory</span>
             </div>
        )}
      </div>
    
      {/* Upload FAB for mobile */}
      <button
         onClick={() => fileInputRef.current?.click()}
         className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/40 text-white flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition"
      >
        <span className="text-2xl">+</span>
      </button>

    </div>
  );
}

function LogoutButton() {
    const { logout } = useAuth();
    return (
        <button
            onClick={logout}
            className="w-12 h-12 rounded-full bg-white border border-pink-100 flex items-center justify-center text-pink-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition shadow-sm"
            title="Log out"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
        </button>
    )
}
