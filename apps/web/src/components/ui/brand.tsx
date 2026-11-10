/** Original wordmark: a simple bead-bar motif (not derived from any third-party brand). */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight text-bark ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect x="2" y="12.5" width="24" height="3" rx="1.5" fill="#E4D8C6" />
        <circle cx="7" cy="14" r="4.5" fill="#B5443A" />
        <circle cx="14" cy="14" r="4.5" fill="#C9952F" />
        <circle cx="21" cy="14" r="4.5" fill="#3D6A8C" />
      </svg>
      <span className="text-xl">Atlas</span>
    </span>
  );
}
