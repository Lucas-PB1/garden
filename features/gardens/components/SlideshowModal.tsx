import type { GardenPhoto, GardenTheme } from "@/features/gardens/types";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay, FaTimes } from "react-icons/fa";

interface SlideshowModalProps {
  photos: GardenPhoto[];
  lovePhrases: string[];
  theme?: GardenTheme;
  onClose: () => void;
  startIndex?: number;
}

/**
 * Fullscreen slideshow modal for immersive viewing of garden photos.
 * Features automatic cycling, keyboard navigation, and deterministic love phrase selection.
 */
export default function SlideshowModal({
  photos,
  lovePhrases,
  theme,
  onClose,
  startIndex = 0,
}: SlideshowModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentPhoto = photos[currentIndex];

  /**
   * Deterministically selects a love phrase based on the photo's unique identifier.
   * Ensures the same phrase always accompanies the same photo.
   * @param id - The unique ID of the photo.
   * @returns An assigned love phrase string.
   */
  const getPhrase = (id: string) => {
    if (!lovePhrases || lovePhrases.length === 0) return "";
    const index =
      Math.abs(
        id.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0),
      ) % lovePhrases.length;
    return lovePhrases[index];
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && photos.length > 1) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, photos.length]);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  if (!currentPhoto) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 z-40 h-1"
        style={{
          background: `linear-gradient(90deg, ${theme?.primaryColor || "#be123c"}, ${theme?.secondaryColor || "#fecdd3"})`,
        }}
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />

      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between p-4">
        <motion.div
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          {currentIndex + 1} / {photos.length}
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04 }}
        >
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            title="Fechar"
          >
            <FaTimes />
          </button>
        </motion.div>
      </div>

      <div className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <div className="flex h-full w-full items-center justify-center p-4 pb-44 pt-20 md:p-12 md:pb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id}
              className="relative flex h-full w-full items-center justify-center md:max-h-[85vh] md:max-w-5xl"
              initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.015, filter: "blur(6px)" }}
              transition={{ duration: 0.34, ease: "easeOut" }}
            >
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                fill
                className="pointer-events-auto rounded-lg object-contain shadow-2xl drop-shadow-2xl"
                priority
                quality={86}
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/80 p-6 text-center backdrop-blur-md md:bottom-8 md:left-1/2 md:w-auto md:max-w-2xl md:-translate-x-1/2 md:rounded-lg md:border"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, delay: 0.08 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {lovePhrases.length > 0 && (
              <p className="mb-2 text-lg font-medium italic text-rose-100 md:text-xl">
                &quot;{getPhrase(currentPhoto.id)}&quot;
              </p>
            )}
            <p className="text-base font-semibold text-white md:text-lg">{currentPhoto.caption}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.button
        type="button"
        onClick={prevSlide}
        className="absolute left-2 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white shadow-md backdrop-blur transition hover:bg-white/20 md:left-4 md:h-12 md:w-12"
        title="Anterior"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <FaChevronLeft />
      </motion.button>
      <motion.button
        type="button"
        onClick={nextSlide}
        className="absolute right-2 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white shadow-md backdrop-blur transition hover:bg-white/20 md:right-4 md:h-12 md:w-12"
        title="Próxima"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <FaChevronRight />
      </motion.button>
    </motion.div>
  );
}
