import Link from "next/link";
import BrandMark from "./BrandMark";

interface BrandLogoProps {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  className?: string;
}

const sizes = {
  sm: { mark: "h-7 w-7", text: "text-lg" },
  md: { mark: "h-9 w-9", text: "text-xl" },
  lg: { mark: "h-12 w-12", text: "text-3xl" },
};

/**
 * Love Garden logo: symbol + serif wordmark. Links home by default; pass `href={null}`
 * to render it as plain content.
 */
export default function BrandLogo({
  href = "/",
  size = "md",
  tone = "dark",
  className = "",
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={`${sizes[size].mark} shrink-0 drop-shadow-sm`} />
      <span
        className={`font-display ${sizes[size].text} whitespace-nowrap font-semibold leading-none tracking-tight ${
          tone === "light" ? "text-white" : "text-brand-ink"
        }`}
      >
        Love <span className="italic text-rose-700">Garden</span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Love Garden — início" className="inline-flex rounded-lg">
      {content}
    </Link>
  );
}
