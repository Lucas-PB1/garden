import type { GardenTheme } from "@/features/gardens/types";
import Image from "next/image";
import React from "react";

interface GardenLayoutProps {
  children: React.ReactNode;
  theme?: GardenTheme;
}

const getSafeCustomBackgroundUrl = (url?: string) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
};

/**
 * Shared container layout providing the visual foundation for the garden application.
 * Includes a subtle floral background, gradient overlays, and a responsive content wrapper.
 */
export default function GardenLayout({ children, theme }: GardenLayoutProps) {
  const customBackgroundUrl = getSafeCustomBackgroundUrl(theme?.customBgUrl);

  return (
    <div
      className="relative min-h-screen bg-rose-50 p-4 transition-colors duration-1000 md:p-8"
      style={{ backgroundColor: theme?.bgType === "minimalist" ? "white" : undefined }}
    >
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {theme?.bgType === "stars" ? (
          <Image src="/bg/stars-bg-v2.png" alt="" fill className="object-cover" priority />
        ) : theme?.bgType === "minimalist" ? (
          <Image
            src="/bg/minimalist-bg-v2.png"
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : theme?.bgType === "floral" || !theme ? (
          <Image
            src="/bg/floral-bg-v2.png"
            alt=""
            fill
            className="object-cover opacity-90"
            priority
          />
        ) : theme?.bgType === "custom" && customBackgroundUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${customBackgroundUrl.replaceAll('"', "%22")}")` }}
          />
        ) : null}

        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0.92), rgba(255,255,255,0.72), ${theme?.secondaryColor || "#fff1f2"}2e)`,
          }}
        ></div>
      </div>
      <div className="relative z-10 transition-all duration-500">{children}</div>
    </div>
  );
}
