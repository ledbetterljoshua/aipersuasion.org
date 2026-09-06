'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/results', label: 'Transcripts' },
  { href: '/implications', label: 'Implications' },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Site" className="border-b border-black bg-white">
      <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-mono">
        <Link href="/" className="font-bold">
          aipersuasion.org
        </Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'underline font-semibold' : 'hover:underline text-gray-700'}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
