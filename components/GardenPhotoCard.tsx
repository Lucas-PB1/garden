import { useState, useEffect } from "react";
import { GardenPhoto } from "@/services/gardenService";

interface GardenPhotoCardProps {
    photo: GardenPhoto;
    phrase?: string;
    onDelete?: (photo: GardenPhoto) => void;
    deletingId?: string | null;
    isOwner?: boolean;
}

export default function GardenPhotoCard({
    photo,
    phrase,
    onDelete,
    deletingId,
    isOwner = false
}: GardenPhotoCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] overflow-hidden group hover:shadow-[0_20px_50px_rgb(236,72,153,0.15)] transition duration-500 relative border border-pink-100/50">
            <div className={`relative aspect-[3/4] overflow-hidden bg-pink-50/50 transition-colors duration-500 ${isLoaded ? 'bg-transparent' : ''}`}>
                <img
                    src={photo.url}
                    alt={photo.caption}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover block transition-all duration-700 ease-out group-hover:scale-[1.03] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02] blur-sm'}`}
                    loading="lazy"
                />

                {isOwner && onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(photo);
                        }}
                        disabled={deletingId === photo.id}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:scale-110 z-20"
                        title="Excluir foto"
                    >
                        {deletingId === photo.id ? (
                            <span className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></span>
                        ) : (
                            <span>🗑️</span>
                        )}
                    </button>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                    {phrase && (
                        <p className="text-pink-100 text-[10px] md:text-xs font-serif italic mb-1 line-clamp-2">
                            "{phrase}"
                        </p>
                    )}
                    <p className="text-white text-sm font-bold drop-shadow-md">{photo.caption}</p>

                    {photo.uploaderName && (
                        <p className="text-white/60 text-[10px] mt-1 font-medium">
                            Enviada por: {photo.uploaderName}
                        </p>
                    )}
                </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300"></div>
        </div>
    );
}
