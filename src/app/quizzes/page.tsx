import Link from 'next/link';
import { listQuizzes } from '@/lib/services/quizzes.service';
import { QuizzesCatalogueClient } from './quizzes-catalogue-client';

export default async function QuizzesPage() {
  const quizzes = await listQuizzes();

  // Extract unique themes
  const allThemes = [...new Set(quizzes.map((q) => q.theme))].sort();

  return (
    <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
      <div className="mb-10">
        <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
          Catalogue public
        </div>
        <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-3">
          Tous les quiz disponibles
        </h1>
        <p className="text-muted text-[17px] max-w-[500px]">
          Choisissez un quiz et commencez à jouer. Aucun compte requis.
        </p>
      </div>

      <QuizzesCatalogueClient quizzes={quizzes} themes={allThemes} />
    </main>
  );
}
