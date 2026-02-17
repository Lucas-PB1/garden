import { GardenTheme } from "@/services/gardenService";
import Image from "next/image";
import React from "react";

interface GardenLayoutProps {
  children: React.ReactNode;
  theme?: GardenTheme;
}

/**
 * Shared container layout providing the visual foundation for the garden application.
 * Includes a subtle floral background, gradient overlays, and a responsive content wrapper.
 */
export default function GardenLayout({ children, theme }: GardenLayoutProps) {
  const primaryColor = theme?.primaryColor || "#fbcfe8";

  return (
    <div
      className="min-h-screen p-4 md:p-8 relative transition-colors duration-1000"
      style={{ backgroundColor: theme?.bgType === 'minimalist' ? 'white' : undefined }}
    >
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {theme?.bgType === 'stars' ? (
          <Image
            src="/bg/stars-bg-v2.png"
            alt="Stars Background"
            fill
            className="object-cover"
            priority
          />
        ) : theme?.bgType === 'minimalist' ? (
          <Image
            src="/bg/minimalist-bg-v2.png"
            alt="Minimalist Background"
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : theme?.bgType === 'floral' || !theme ? (
          <Image
            src="/bg/floral-bg-v2.png"
            alt="Floral Background"
            fill
            className="object-cover opacity-90"
            priority
          />
        ) : theme?.bgType === 'custom' && theme.customBgUrl ? (
          <Image
            src={theme.customBgUrl}
            alt="Custom Background"
            fill
            className="object-cover"
          />
        ) : null}

        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `linear-gradient(to bottom, white, transparent, ${theme?.secondaryColor || '#fff1f2'}33)`
          }}
        ></div>
      </div>
      <div className="relative z-10 transition-all duration-500">{children}</div>
    </div>
  );
}
