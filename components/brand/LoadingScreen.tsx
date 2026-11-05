import BrandMark from "./BrandMark";

/**
 * Full-screen branded loading state shared by every page.
 */
export default function LoadingScreen({ label = "Carregando..." }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream"
      role="status"
      aria-live="polite"
    >
      <BrandMark className="h-14 w-14 animate-[lg-pulse_1.6s_ease-in-out_infinite]" />
      <span className="text-sm font-semibold text-rose-900/70">{label}</span>
    </div>
  );
}
