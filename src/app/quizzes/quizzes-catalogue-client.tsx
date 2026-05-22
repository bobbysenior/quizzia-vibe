'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Quiz } from '@/lib/types';

const themeGradients = [
  'bg-[linear-gradient(135deg,oklch(75%_0.18_280),oklch(85%_0.14_240))]',
  'bg-[linear-gradient(135deg,oklch(80%_0.16_60),oklch(85%_0.16_30))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.14_150),oklch(85%_0.12_180))]',
  'bg-[linear-gradient(135deg,oklch(72%_0.2_340),oklch(80%_0.18_20))]',
  'bg-[linear-gradient(135deg,oklch(75%_0.14_220),oklch(85%_0.1_260))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.15_110),oklch(85%_0.12_80))]',
];

interface Props {
  quizzes: Quiz[];
  themes: string[];
}

export function QuizzesCatalogueClient({ quizzes, themes }: Props) {
  const [search, setSearch] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(search.toLowerCase()) ||
        quiz.theme.toLowerCase().includes(search.toLowerCase());
      const matchesTheme =
        selectedThemes.length === 0 || selectedThemes.includes(quiz.theme);
      return matchesSearch && matchesTheme;
    });
  }, [quizzes, search, selectedThemes]);

  function toggleTheme(theme: string) {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  }

  function clearFilters() {
    setSearch('');
    setSelectedThemes([]);
  }

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Recherche */}
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="search" className="text-[13px] font-medium text-ink-2">
            Rechercher
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Titre ou thème..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-elev border border-line rounded-xl py-3 px-4 pl-10 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition"
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filtres thèmes */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-[13px] font-medium text-ink-2 mr-1">Thèmes :</span>
        {themes.map((theme) => {
          const active = selectedThemes.includes(theme);
          return (
            <button
              key={theme}
              onClick={() => toggleTheme(theme)}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                active
                  ? 'bg-ink text-white border-ink'
                  : 'bg-bg-elev text-ink-2 border-line hover:border-ink hover:bg-bg-soft'
              }`}
            >
              {theme}
            </button>
          );
        })}

        {(search || selectedThemes.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted hover:text-ink underline underline-offset-[3px] ml-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-lg">Aucun quiz ne correspond à votre recherche.</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px transition"
          >
            Réinitialiser les filtres →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz, i) => (
            <Link
              key={quiz.id}
              href={`/quizzes/${quiz.id}`}
              className="group bg-bg-elev border border-line-2 rounded-[22px] p-6 flex flex-col min-h-[220px] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-line"
            >
              <div
                className={`h-[90px] rounded-2xl -mx-6 -mt-6 mb-5 relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(40%_60%_at_70%_30%,rgba(255,255,255,0.5),transparent_60%),radial-gradient(50%_60%_at_20%_80%,rgba(0,0,0,0.15),transparent_60%)] ${themeGradients[i % themeGradients.length]}`}
              >
                <span className="absolute right-4 bottom-3 font-mono text-[11px] text-black/45 uppercase tracking-[0.08em]">
                  {quiz.theme}
                </span>
              </div>
              <h3 className="text-[19px] font-semibold tracking-[-0.02em] leading-[1.25] mb-2">
                {quiz.title}
              </h3>
              <div className="flex gap-2 mt-auto">
                <span className="text-[11px] font-mono font-medium uppercase tracking-[0.04em] px-2 py-1 rounded-full bg-bg-soft text-ink-2">
                  {quiz.question_count} Q
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-soft text-ink-2">
                  {quiz.theme}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
