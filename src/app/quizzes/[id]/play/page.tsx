'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { startAttempt, answerQuestion, finishAttempt } from './actions';
import type { QuizQuestion } from '@/lib/services/quizzes.service';

const labelKeys = ['A', 'B', 'C', 'D'];

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const result = await startAttempt(id, 1); // total_questions will be set by questions length
        if (cancelled) return;
        setQuestions(result.questions);
        setAttemptId(result.attemptId);
      } catch (e) {
        if (!cancelled) setError('Impossible de démarrer le quiz.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [id]);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const totalQuestions = questions.length;

  const handleSelect = useCallback(
    async (choiceId: string) => {
      if (submitting || feedback || !attemptId || !currentQuestion) return;
      setSubmitting(true);
      setSelectedChoiceId(choiceId);

      try {
        const result = await answerQuestion(attemptId, currentQuestion.id, choiceId);
        setFeedback({ isCorrect: result.isCorrect });
        setAnsweredIds(result.answeredQuestionIds);

        setTimeout(() => {
          if (isLastQuestion) {
            router.push(`/quizzes/${id}/results?attempt=${attemptId}`);
          } else {
            setCurrentIdx((i) => i + 1);
            setSelectedChoiceId(null);
            setFeedback(null);
          }
          setSubmitting(false);
        }, 1200);
      } catch (e) {
        setError("Erreur lors de l'enregistrement de la réponse.");
        setSubmitting(false);
        setSelectedChoiceId(null);
      }
    },
    [submitting, feedback, attemptId, currentQuestion, isLastQuestion, id, router]
  );

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),oklch(75%_0.2_320),oklch(80%_0.15_200),var(--color-accent))] animate-[spin_4s_linear_infinite] shadow-[0_0_40px_oklch(70%_0.2_280_/_0.4)]" />
          <p className="text-muted">Préparation de votre quiz…</p>
        </div>
      </main>
    );
  }

  if (error || !currentQuestion) {
    return (
      <main className="flex items-center justify-center min-h-[70vh]">
        <p className="text-muted">{error || 'Quiz introuvable.'}</p>
      </main>
    );
  }

  return (
    <main className="py-12 px-8 max-w-[780px] mx-auto max-sm:py-8 max-sm:px-5">
      {/* Progress */}
      <div className="flex items-center justify-between font-mono text-xs text-muted mb-10">
        <span>
          Question {currentIdx + 1} / {totalQuestions}
        </span>
        <div className="flex-1 h-1 bg-line-2 rounded-full overflow-hidden mx-5">
          <div
            className="h-full bg-ink rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span>{answeredIds.length} répondu{answeredIds.length > 1 ? 'es' : 'e'}</span>
      </div>

      {/* Question */}
      <h2 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.2] mb-8">
        {currentQuestion.question_text}
      </h2>

      {/* Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQuestion.choices.map((choice, i) => {
          const isSelected = selectedChoiceId === choice.id;
          const isRevealed = feedback !== null;
          let borderClass = 'border-line hover:border-ink hover:-translate-y-px';
          let keyClass = 'bg-bg-soft text-muted';

          if (isRevealed && isSelected) {
            if (feedback.isCorrect) {
              borderClass = 'border-good bg-[oklch(96%_0.06_150)]';
              keyClass = 'bg-good text-white';
            } else {
              borderClass = 'border-bad bg-[oklch(96%_0.05_25)]';
              keyClass = 'bg-bad text-white';
            }
          } else if (isSelected) {
            borderClass = 'border-ink bg-bg-soft';
            keyClass = 'bg-ink text-white';
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={submitting}
              className={`text-left bg-bg-elev border rounded-2xl px-4 py-4 text-[15px] flex items-center gap-3 transition ${borderClass} disabled:cursor-default`}
            >
              <span
                className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center font-mono text-xs font-medium transition shrink-0 ${keyClass}`}
              >
                {labelKeys[i]}
              </span>
              {choice.choice_text}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-6 text-center text-base font-medium animate-[rise_400ms_ease-out] ${
            feedback.isCorrect ? 'text-good' : 'text-bad'
          }`}
        >
          {feedback.isCorrect ? '✓ Bonne réponse !' : '✗ Pas tout à fait…'}
        </div>
      )}
    </main>
  );
}
