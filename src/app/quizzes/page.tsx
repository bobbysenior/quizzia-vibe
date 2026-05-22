import Link from 'next/link';
import { listQuizzes } from '@/lib/services/quizzes.service';

const themeGradients = [
  'bg-[linear-gradient(135deg,oklch(75%_0.18_280),oklch(85%_0.14_240))]',
  'bg-[linear-gradient(135deg,oklch(80%_0.16_60),oklch(85%_0.16_30))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.14_150),oklch(85%_0.12_180))]',
  'bg-[linear-gradient(135deg,oklch(72%_0.2_340),oklch(80%_0.18_20))]',
  'bg-[linear-gradient(135deg,oklch(75%_0.14_220),oklch(85%_0.1_260))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.15_110),oklch(85%_0.12_80))]',
];

export default async function QuizzesPage() {
  const quizzes = await listQuizzes();

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

      {quizzes.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-lg">Aucun quiz publié pour le moment.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px transition"
          >
            Créer le premier quiz →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz, i) => (
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
              <h3 className="text-[19px] font-semibold tracking-[-0.02em] leading-[1.25] mb-2">{quiz.title}</h3>
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
    </main>
  );
}
