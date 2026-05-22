'use server';

import {
  getQuizQuestions,
  createQuizAttempt,
  submitAnswer,
  completeAttempt,
} from '@/lib/services/quizzes.service';
import type { QuizQuestion } from '@/lib/services/quizzes.service';

export async function startAttempt(
  quizId: string
): Promise<{ attemptId: string; questions: QuizQuestion[] }> {
  const questions = await getQuizQuestions(quizId);
  const attempt = await createQuizAttempt(quizId, questions.length);
  return { attemptId: attempt.id, questions };
}

export async function answerQuestion(
  attemptId: string,
  questionId: string,
  choiceId: string
): Promise<{ isCorrect: boolean; answeredQuestionIds: string[] }> {
  return await submitAnswer(attemptId, questionId, choiceId);
}

export async function finishAttempt(
  attemptId: string
): Promise<{ score: number; total: number }> {
  return await completeAttempt(attemptId);
}
