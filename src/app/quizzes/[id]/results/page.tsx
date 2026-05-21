import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getExistingAttempt, completeAttempt, getQuizById } from '@/lib/services/quizzes.service';

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;

  if (!attemptId) redirect(`/quizzes/${id}`);

  let attempt = await getExistingAttempt(attemptId);
  if (!attempt) redirect(`/quizzes/${id}`);

  // Complete the attempt if not already done
  if (attempt.status === 'in_progress') {
    const { score, total } = await completeAttempt(attemptId);
    attempt = { ...attempt, status: 'completed', score, total_questions: total };
  }

  const quiz = await getQuizById(id);
  const score = attempt.score ?? 0;
  const total = attempt.total_questions;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪';
  const message =
    pct >= 80
      ? 'Excellent ! Vous maîtrisez le sujet.'
      : pct >= 60
        ? 'Pas mal du tout. Continuez comme ça !'
        : pct >= 40
          ? "Quelques révisions et vous serez au top."
          : 'Chaque quiz est une occasion d\'apprendre. Recommencez !';

  return (
    <main className="py-16 px-8 max-w-[600px] mx-auto text-center max-sm:py-10 max-sm:px-5">
      <div className="text-6xl mb-6">{emoji}</div>

      <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-4">
        Quiz terminé
      </div>

      <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-2">
        {quiz?.title ?? 'Résultats'}
      </h1>

      <div className="mt-10 bg-bg-elev border border-line-2 rounded-[22px] p-10 max-sm:p-6">
        <div className="text-7xl font-semibold tracking-[-0.035em] mb-3">
          {pct}
          <span className="text-3xl text-muted ml-1">%</span>
        </div>
        <div className="text-muted text-[17px] mb-6">
          {score} / {total} bonnes réponses
        </div>

        {/* Score bar */}
        <div className="w-full h-3 bg-line-2 rounded-full overflow-hidden mb-8">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              pct >= 80 ? 'bg-good' : pct >= 60 ? 'bg-warn' : 'bg-bad'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-ink-2 text-[17px] leading-relaxed">{message}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <Link
          href={`/quizzes/${id}/play`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px transition w-full sm:w-auto"
        >
          Rejouer <span>→</span>
        </Link>
        <Link
          href="/quizzes"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-line text-ink text-base font-medium hover:bg-bg-soft hover:border-ink transition w-full sm:w-auto"
        >
          Voir tous les quiz
        </Link>
      </div>
    </main>
  );
}
