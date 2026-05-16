'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth/actions';

interface Props {
  userEmail?: string | null;
}

export default function Nav({ userEmail }: Props) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm px-3.5 py-2 rounded-full transition-colors ${
      pathname === href
        ? 'text-ink font-medium'
        : 'text-ink-2 hover:bg-bg-soft hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg/80 border-b border-line-2">
      <div className="max-w-[1200px] mx-auto px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[17px] tracking-[-0.02em]">
          <span className="w-[22px] h-[22px] rounded-md bg-ink relative overflow-hidden after:absolute after:inset-1 after:rounded-[3px] after:bg-[linear-gradient(135deg,var(--color-accent),oklch(70%_0.2_320))]" />
          Quizia
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={linkClass('/')}>Découvrir</Link>
          <Link href="/#bibliotheque" className={linkClass('/#bibliotheque')}>Bibliothèque</Link>
          {userEmail && (
            <Link href="/stats" className={linkClass('/stats')}>Statistiques</Link>
          )}
          {userEmail ? (
            <button
              onClick={() => signOut()}
              className="text-sm text-ink-2 px-3.5 py-2 rounded-full hover:bg-bg-soft hover:text-ink transition-colors"
            >
              Déconnexion
            </button>
          ) : (
            <Link href="/login" className={linkClass('/login')}>Se connecter</Link>
          )}
        </nav>

        {userEmail ? (
          <Link
            href="/quizzes/new"
            className="text-sm font-medium px-4 py-2 rounded-full bg-ink text-white hover:opacity-90 transition"
          >
            + Nouveau quiz
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full bg-ink text-white hover:opacity-90 transition"
          >
            Créer un quiz
          </Link>
        )}
      </div>
    </header>
  );
}
