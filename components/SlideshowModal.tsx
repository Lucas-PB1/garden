import { useState, useEffect, useCallback } from "react";
import { GardenPhoto } from "@/services/gardenService";

interface SlideshowModalProps {
    photos: GardenPhoto[];
    lovePhrases: string[];
    onClose: () => void;
    startIndex?: number;
}

export default function SlideshowModal({
    photos,
    lovePhrases,
    onClose,
    startIndex = 0
}: SlideshowModalProps) {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
    const [animating, setAnimating] = useState(false);

    const currentPhoto = photos[currentIndex];
    
    // Deterministic phrase selection logic
    const getPhrase = (id: string) => {
        if (!lovePhrases || lovePhrases.length === 0) return "";
        const index = Math.abs(id.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % lovePhrases.length;
        return lovePhrases[index];
    };

    const nextSlide = useCallback(() => {
        setSlideDirection('next');
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
            setAnimating(false);
        }, 300); // Wait for exit animation
    }, [photos.length]);

    const prevSlide = useCallback(() => {
        setSlideDirection('prev');
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
            setAnimating(false);
        }, 300);
    }, [photos.length]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !animating) {
            interval = setInterval(nextSlide, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, nextSlide, animating]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
            if (e.key === "Escape") onClose();
            if (e.key === " ") {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, onClose]);

    if (!currentPhoto) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center animate-fade-in text-gray-800">
             {/* Background Decoration (matching site) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[80px] mix-blend-multiply"></div>
            </div>

            {/* Controls - Top */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-50">
                <div className="text-sm font-medium bg-white/80 backdrop-blur px-3 py-1 rounded-full text-pink-600 shadow-sm border border-pink-100">
                    {currentIndex + 1} / {photos.length}
                </div>
                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white text-gray-500 hover:text-gray-800 transition shadow-sm border border-pink-100"
                >
                    ✕
                </button>
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-0 md:p-0 overflow-hidden pointer-events-none"> 
                {/* Visual wrapper with padding to clear controls */}
                <div className="w-full h-full flex items-center justify-center p-4 pb-20 pt-16 md:p-24">
                    <div
                        key={currentIndex}
                        className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-500 transform ${
                            animating 
                                ? (slideDirection === 'next' ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0')
                                : 'translate-x-0 opacity-100'
                        }`}
                    >
                         <img 
                            src={currentPhoto.url} 
                            alt={currentPhoto.caption} 
                            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl pointer-events-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Content Overlay - Bottom */}
            <div className="absolute bottom-0 inset-x-0 md:bottom-12 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-2xl md:rounded-2xl p-6 pb-12 md:pb-6 bg-white/90 md:bg-white/80 backdrop-blur-md md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-40 text-center transition-all duration-500 border-t md:border border-pink-100/50">
                <div className={`${animating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
                    {lovePhrases.length > 0 && (
                        <p className="text-pink-500 font-serif italic text-lg md:text-xl mb-2 drop-shadow-sm">
                            "{getPhrase(currentPhoto.id)}"
                        </p>
                    )}
                    <p className="text-gray-700 font-medium text-base md:text-lg">
                        {currentPhoto.caption}
                    </p>
                </div>
            </div>

            {/* Play/Pause Control - Floating Bottom Center (Adjusted for desktop card) */}
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/80 backdrop-blur hover:bg-white rounded-full flex items-center justify-center text-pink-500 transition z-50 border border-pink-200 shadow-md transform md:translate-y-1/2"
            >
                {isPlaying ? "⏸" : "▶️"}
            </button>

             {/* Navigation Arrows */}
             <button 
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur hover:bg-white rounded-full flex items-center justify-center text-pink-400 hover:text-pink-600 transition z-50 border border-pink-200 shadow-md"
            >
                ◀
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur hover:bg-white rounded-full flex items-center justify-center text-pink-400 hover:text-pink-600 transition z-50 border border-pink-200 shadow-md"
            >
                ▶
            </button>
        </div>
    );
}
