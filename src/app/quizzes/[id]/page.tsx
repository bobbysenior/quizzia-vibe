import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getQuizById } from '@/lib/services/quizzes.service';

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getQuizById(id);

  if (!quiz) notFound();

  return (
    <main className="py-16 px-8 max-w-[780px] mx-auto max-sm:py-10 max-sm:px-5">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        ← Retour aux quiz
      </Link>

      <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-4">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
        {quiz.theme}
      </div>

      <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-4">
        {quiz.title}
      </h1>

      <p className="text-muted text-[17px] leading-relaxed mb-10">
        {quiz.actual_question_count} questions — Prêt à tester vos connaissances sur {quiz.theme.toLowerCase()} ?
      </p>

      <div className="bg-bg-elev border border-line-2 rounded-[22px] p-8 max-sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[linear-gradient(135deg,var(--color-accent),oklch(70%_0.2_320))] flex items-center justify-center text-white font-bold text-xl">
              {quiz.actual_question_count}
            </div>
            <div>
              <div className="font-medium text-[17px]">Questions</div>
              <div className="text-sm text-muted">Une par une, sans pression</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-bg-soft flex items-center justify-center text-ink-2 text-xl">
              ∞
            </div>
            <div>
              <div className="font-medium text-[17px]">Pas de limite</div>
              <div className="text-sm text-muted">Prenez votre temps</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-line-2">
          <Link
            href={`/quizzes/${quiz.id}/play`}
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-ink text-white text-lg font-medium hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition"
          >
            Commencer le quiz <span>→</span>
          </Link>

          <p className="text-center mt-4 text-[13px] text-muted">
            Vos résultats s&apos;afficheront à la fin. Aucune inscription requise.
          </p>
        </div>
      </div>
    </main>
  );
}
