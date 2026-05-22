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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-[17px] tracking-[-0.02em]">
          <span className="w-[22px] h-[22px] rounded-md bg-ink relative overflow-hidden after:absolute after:inset-1 after:rounded-[3px] after:bg-[linear-gradient(135deg,var(--color-accent),oklch(70%_0.2_320))]" />
          Quizia
        </Link>

        {/* Centre — navigation */}
        <nav className="flex items-center gap-1">
          {!userEmail && <Link href="/" className={linkClass('/')}>Découvrir</Link>}
          {userEmail && (
            <>
              <Link href="/dashboard" className={linkClass('/dashboard')}>Tableau de bord</Link>
              <Link href="/my-quizzes" className={linkClass('/my-quizzes')}>Mes quiz</Link>
            </>
          )}
          <Link href="/quizzes" className={linkClass('/quizzes')}>Catalogue</Link>
        </nav>

        {/* Droite — actions */}
        <div className="flex items-center gap-2">
          {userEmail ? (
            <>
              <Link
                href="/quizzes/new"
                className="text-sm font-medium px-4 py-2 rounded-full bg-ink text-white hover:opacity-90 transition"
              >
                + Nouveau quiz
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-bad px-3.5 py-2 rounded-full border border-bad/20 bg-[oklch(96%_0.05_25)] hover:bg-[oklch(94%_0.06_25)] transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-full bg-ink text-white hover:opacity-90 transition"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
