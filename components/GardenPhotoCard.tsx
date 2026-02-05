import { useState, useEffect } from "react";
import { GardenPhoto } from "@/services/gardenService";

interface GardenPhotoCardProps {
    photo: GardenPhoto;
    lovePhrases: string[];
    onDelete?: (photo: GardenPhoto) => void;
    deletingId?: string | null;
    isOwner?: boolean;
}

export default function GardenPhotoCard({ 
    photo, 
    lovePhrases, 
    onDelete, 
    deletingId, 
    isOwner = false 
}: GardenPhotoCardProps) {
    const [phrase, setPhrase] = useState<string>("");

    useEffect(() => {
        if (lovePhrases && lovePhrases.length > 0) {
            // Pick a random phrase on mount
            const randomPhrase = lovePhrases[Math.floor(Math.random() * lovePhrases.length)];
            setPhrase(randomPhrase);
        }
    }, [lovePhrases]);

    return (
        <div className="break-inside-avoid bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] overflow-hidden group hover:shadow-[0_20px_50px_rgb(236,72,153,0.15)] transition duration-500 relative border border-pink-100/50">
            <div className="relative">
                <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-auto block transition duration-700 group-hover:scale-[1.03]"
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

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-5 pt-12 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                    {phrase && (
                        <p className="text-pink-200 text-xs font-serif italic mb-1">
                            {phrase}
                        </p>
                    )}
                    <p className="text-white text-sm font-medium drop-shadow-md">{photo.caption}</p>
                </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300"></div>
        </div>
    );
}
