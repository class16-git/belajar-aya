/**
 * Original Atlas typographic cover. Publisher artwork is never copied or hot-linked (rights + privacy), so each
 * book gets a calm generated cover: a palette and motif chosen from its id and topic, with the title set in type.
 */
const PALETTES = [
  ['#F3E7D3', '#B5443A', '#5B4636'],
  ['#E3EFE6', '#4F7A5A', '#2E2620'],
  ['#E2ECF5', '#2F5370', '#2E2620'],
  ['#F6E3D5', '#8F4A28', '#2E2620'],
  ['#EFE8F6', '#5D4A7A', '#2E2620'],
  ['#FBF1D0', '#9A7413', '#2E2620'],
] as const;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function lines(title: string, max = 11): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of title.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out.slice(0, 3);
}

export function BookCover({ id, title, topic, size = 'md' }: { id: string; title: string; topic: string; size?: 'sm' | 'md' | 'lg' }) {
  const [bg, accent, ink] = PALETTES[hash(id) % PALETTES.length]!;
  const t = lines(title);
  const motif =
    topic === 'nature' || topic === 'science' ? (
      <g fill={accent} opacity="0.85">
        <ellipse cx="150" cy="190" rx="34" ry="14" transform="rotate(-30 150 190)" />
        <ellipse cx="118" cy="205" rx="30" ry="12" transform="rotate(25 118 205)" />
        <rect x="132" y="196" width="4" height="40" rx="2" />
      </g>
    ) : topic === 'animals' ? (
      <g fill={accent} opacity="0.85">
        <circle cx="135" cy="205" r="26" />
        <circle cx="117" cy="180" r="8" />
        <circle cx="153" cy="180" r="8" />
      </g>
    ) : topic === 'food' ? (
      <g fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" opacity="0.85">
        <path d="M95 215a40 40 0 0 1 80 0" />
        <path d="M108 215a27 27 0 0 1 54 0" />
      </g>
    ) : (
      <g fill={accent} opacity="0.85">
        <circle cx="120" cy="205" r="16" />
        <circle cx="150" cy="205" r="16" />
        <rect x="104" y="214" width="62" height="18" rx="9" />
      </g>
    );
  const w = size === 'sm' ? 'w-24' : size === 'lg' ? 'w-48 sm:w-56' : 'w-32';
  return (
    <svg viewBox="0 0 180 250" className={`${w} h-auto shrink-0 self-start rounded-lg shadow-soft`} aria-hidden="true" focusable="false" data-testid="book-cover">
      <rect width="180" height="250" rx="10" fill={bg} />
      <rect x="10" y="10" width="160" height="230" rx="8" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
      {t.map((l, i) => (
        <text key={i} x="90" y={56 + i * 30} textAnchor="middle" fontSize="24" fontWeight="700" fill={ink} fontFamily="inherit">
          {l}
        </text>
      ))}
      {motif}
    </svg>
  );
}
