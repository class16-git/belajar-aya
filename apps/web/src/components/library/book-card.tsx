import Link from 'next/link';
import type { Book } from '@atlas/curriculum';
import type { Locale } from '@atlas/shared';
import type { Dictionary } from '@/lib/i18n';
import { BookCover } from './book-cover';

export function BookCard({ book, t, locale, href }: { book: Book; t: Dictionary; locale: Locale; href: string }) {
  const writer = book.creators.find((c) => c.role === 'writer')?.name;
  return (
    <li className="card flex gap-4" data-book={book.id}>
      <BookCover id={book.id} title={book.title} topic={book.topics[0]!} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-lg font-bold leading-snug">{book.title}</h3>
        {writer && <p className="text-sm muted">{writer}</p>}
        <p className="line-clamp-3 text-sm">{book.synopsis[locale]}</p>
        <p className="flex flex-wrap gap-1.5">
          {book.stages.map((s) => <span key={s} className="chip border-sand bg-linen text-bark">{t.library.stageName[s]}</span>)}
          <span className="chip border-sky bg-sky-light text-[#2f5370]">{t.library.role[book.role]}</span>
        </p>
        {book.publicationStatus !== 'published' && <p className="chip w-fit border-clay bg-clay-light text-clay-dark" data-testid="preview-badge">{t.library.previewBadge}</p>}
        <Link href={href} className="btn-primary mt-auto w-fit" aria-label={`${t.library.view}: ${book.title}`}>{t.library.view}</Link>
      </div>
    </li>
  );
}
