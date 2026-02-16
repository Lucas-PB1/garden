import React from "react";

interface GardenLayoutProps {
    children: React.ReactNode;
}

export default function GardenLayout({ children }: GardenLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4 md:p-8 relative">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-white"></div>
                <img
                    src="/bg/floral-bg.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-pink-50/30"></div>
            </div>
            <div className="relative z-10 transition-all duration-500">
                {children}
            </div>
        </div>
    );
}
