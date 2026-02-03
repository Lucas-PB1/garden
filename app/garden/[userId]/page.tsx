"use client";

import { useEffect, useState } from "react";
import { getGardenPhotos, GardenPhoto } from "@/services/gardenService";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SharedGardenPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
        if (userId) {
            try {
                const data = await getGardenPhotos(userId);
                setPhotos(data);
            } catch (error) {
                console.error("Error fetching photos:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    fetchPhotos();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8] p-4 md:p-8 relative">
       {/* Decorative Background */}
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px] mix-blend-multiply"></div>
            <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-green-200/30 rounded-full blur-[60px] mix-blend-multiply"></div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center mb-10 relative z-10 gap-4">
        <div>
            <span className="text-pink-500 font-medium tracking-wider text-sm uppercase">Visiting</span>
            <h1 className="text-4xl font-serif font-bold text-gray-800">
             Garden Collection
            </h1>
            <p className="text-gray-500 text-sm mt-1">Viewing {photos.length} beautiful memories</p>
        </div>
        
        <Link 
            href="/garden"
            className="px-6 py-2.5 rounded-full bg-white text-gray-800 font-medium shadow-sm border border-gray-100 hover:bg-gray-50 transition text-sm flex items-center gap-2"
        >
            <span>🏡</span> Go to My Garden
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-[3/4] bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] overflow-hidden group hover:shadow-xl transition duration-300 relative border border-white/60"
          >
            <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white text-xs font-medium">{photo.caption}</p>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {photos.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-400">
                <p className="text-xl font-serif italic">This garden is awaiting its first bloom.</p>
             </div>
        )}
      </div>
    </div>
  );
}
