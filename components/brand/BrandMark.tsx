interface BrandMarkProps {
  className?: string;
  title?: string;
}

/**
 * Love Garden symbol: a heart that sprouts a leaf — love that keeps growing.
 * Shares its geometry with `app/icon.svg` so the favicon and the in-app logo match.
 */
export default function BrandMark({ className = "h-9 w-9", title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="9" fill="var(--color-brand-ink, #4c0519)" />
      <path
        d="M16 25.5s-8.5-5.1-8.5-11.1a4.6 4.6 0 0 1 8.5-2.5 4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11.1-8.5 11.1z"
        fill="#fda4af"
      />
      <path d="M16 12.2c-.2-3.1 1.7-5.6 5.2-6.4-.1 3.2-2 5.7-5.2 6.4z" fill="#6ee7b7" />
      <path d="M16 12.6V9.4" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
