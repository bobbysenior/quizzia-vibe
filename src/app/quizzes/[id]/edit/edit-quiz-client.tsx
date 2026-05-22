'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadQuizForEdit } from '@/lib/quiz/actions';
import type { Quiz } from '@/lib/types';
import type { QuizQuestionWithChoices } from '@/lib/services/quizzes.service';
import { QuizEditor } from './quiz-editor';
import Link from 'next/link';

export function EditQuizClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [state, setState] = useState<{
    status: 'loading' | 'notFound' | 'ready';
    quiz?: Quiz;
    questions?: QuizQuestionWithChoices[];
  }>({ status: 'loading' });

  useEffect(() => {
    loadQuizForEdit(quizId).then((res) => {
      if (res.notFound) {
        setState({ status: 'notFound' });
        return;
      }
      setState({ status: 'ready', quiz: res.quiz, questions: res.questions });
    });
  }, [quizId]);

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

  return <QuizEditor quiz={state.quiz!} questions={state.questions!} />;
}
