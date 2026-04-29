import type { GardenPhoto } from "@/features/gardens/types";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

interface GardenPhotoCardProps {
  photo: GardenPhoto;
  phrase?: string;
  onDelete?: (photo: GardenPhoto) => void;
  onOpen?: (photo: GardenPhoto) => void;
  deletingId?: string | null;
  isOwner?: boolean;
  priority?: boolean;
}

/**
 * Component for displaying an individual garden photo with its caption and optional phrase.
 * Features a high-quality center-cropped image and interactive delete action for owners.
 */
export default function GardenPhotoCard({
  photo,
  phrase,
  onDelete,
  onOpen,
  deletingId,
  isOwner = false,
  priority = false,
}: GardenPhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.article
      className="group relative overflow-hidden rounded-lg border border-rose-100 bg-white shadow-[0_18px_60px_rgba(127,29,29,0.08)]"
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.34, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -4, boxShadow: "0 24px 70px rgba(127, 29, 29, 0.12)" }}
      whileTap={{ scale: 0.995 }}
    >
      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(photo)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label={`Abrir memória ${photo.caption}`}
        />
      )}

      <div
        className={`relative aspect-[3/4] overflow-hidden bg-rose-50/50 transition-colors duration-500 ${isLoaded ? "bg-transparent" : ""}`}
      >
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-rose-50 via-white to-rose-100" />
        )}

        <Image
          src={photo.url}
          alt={photo.caption}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          fill
          priority={priority}
          quality={74}
          sizes="(max-width: 640px) calc((100vw - 48px) / 2), (max-width: 1024px) calc((100vw - 96px) / 3), 290px"
          className={`object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0 blur-sm"}`}
        />

        {isOwner && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo);
            }}
            disabled={deletingId === photo.id}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-red-500 opacity-0 shadow-md backdrop-blur transition-all duration-300 hover:bg-red-50 focus:opacity-100 group-hover:opacity-100"
            title="Excluir foto"
          >
            {deletingId === photo.id ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500"></span>
            ) : (
              <FaTrash />
            )}
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 pt-14 opacity-100 transition duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          {phrase && (
            <p className="mb-1 line-clamp-2 text-[11px] font-medium italic text-rose-100 md:text-xs">
              &quot;{phrase}&quot;
            </p>
          )}
          <p className="text-sm font-semibold text-white drop-shadow-md">{photo.caption}</p>

          {photo.uploaderName && (
            <p className="mt-1 text-[10px] font-medium text-white/65">
              Enviada por {photo.uploaderName}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
