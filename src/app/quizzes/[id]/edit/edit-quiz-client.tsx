'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadQuizForEdit } from '@/lib/quiz/actions';
import type { Quiz } from '@/lib/types';
import type { QuizQuestionWithChoices } from '@/lib/services/quizzes.service';
import { QuizEditor } from './quiz-editor';

export function EditQuizClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [state, setState] = useState<{
    status: 'loading' | 'notFound' | 'generating' | 'ready';
    quiz?: Quiz;
    questions?: QuizQuestionWithChoices[];
  }>({ status: 'loading' });

  const load = useCallback(async () => {
    const res = await loadQuizForEdit(quizId);
    if (res.notFound) {
      setState({ status: 'notFound' });
      return;
    }
    if (res.quiz.title === 'Génération en cours…' && res.questions.length === 0) {
      setState({ status: 'generating', quiz: res.quiz, questions: res.questions });
      return;
    }
    setState({ status: 'ready', quiz: res.quiz, questions: res.questions });
  }, [quizId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (state.status === 'notFound') {
      router.replace('/quizzes');
    }
  }, [state.status, router]);

  if (state.status === 'notFound' || state.status === 'loading') {
    return (
      <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
        <div className="bg-bg-elev border border-line-2 rounded-[22px] p-10 text-center">
          <div className="w-10 h-10 rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),oklch(75%_0.2_320),oklch(80%_0.15_200),var(--color-accent))] animate-[spin_4s_linear_infinite] shadow-[0_0_40px_oklch(70%_0.2_280_/_0.4)] mx-auto" />
        </div>
      </main>
    );
  }

  if (state.status === 'generating') {
    return (
      <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
        <div className="bg-bg-elev border border-line-2 rounded-[22px] p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),oklch(75%_0.2_320),oklch(80%_0.15_200),var(--color-accent))] animate-[spin_4s_linear_infinite] shadow-[0_0_40px_oklch(70%_0.2_280_/_0.4)] mx-auto mb-6" />
          <h3 className="text-[22px] font-semibold tracking-[-0.018em] mb-2">Génération en cours…</h3>
          <p className="text-muted text-[15px] max-w-[400px] mx-auto mb-6">
            L&apos;intelligence artificielle prépare votre quiz. Cette page se mettra à jour automatiquement.
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line text-sm font-medium text-ink hover:bg-bg-soft hover:border-ink transition"
          >
            Rafraîchir
          </button>
        </div>
      </main>
    );
  }

  return <QuizEditor quiz={state.quiz!} questions={state.questions!} />;
}
