import { createClient } from '@/lib/supabase/server';
import type { Quiz, QuizWithCount, QuizStatus } from '@/lib/types';

export interface UserStats {
  completedCount: number;
  createdCount: number;
  archivedCount: number;
  averageScore: number | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quizzes: { title: string; theme: string }[] | null;
}

export async function getUserStats(): Promise<UserStats | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: completedCount } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'estimated', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const { count: createdCount } = await supabase
    .from('quizzes')
    .select('*', { count: 'estimated', head: true })
    .eq('creator_id', user.id);

  const { count: archivedCount } = await supabase
    .from('quizzes')
    .select('*', { count: 'estimated', head: true })
    .eq('creator_id', user.id)
    .eq('status', 'archived');

  const { data: avgData } = await supabase
    .from('quiz_attempts')
    .select('score, total_questions')
    .eq('user_id', user.id)
    .eq('status', 'completed');

  let averageScore: number | null = null;
  if (avgData && avgData.length > 0) {
    const total = avgData.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0);
    averageScore = Math.round(total / avgData.length);
  }

  return {
    completedCount: completedCount ?? 0,
    createdCount: createdCount ?? 0,
    archivedCount: archivedCount ?? 0,
    averageScore,
  };
}

export async function getUserAttempts(limit = 6): Promise<QuizAttempt[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, score, total_questions, completed_at, quizzes(title, theme)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as QuizAttempt[];
}

export async function getUserQuizzes(): Promise<Quiz[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listQuizzes(): Promise<Quiz[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getQuizById(id: string): Promise<QuizWithCount | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return {
    ...data,
    actual_question_count: data.questions[0]?.count ?? 0,
  } as QuizWithCount;
}

interface CreateQuizInput {
  title: string;
  theme: string;
  question_count: number;
  status?: QuizStatus;
}

export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Vous devez être connecté pour créer un quizz.');
  }

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      creator_id: user.id,
      title: input.title,
      theme: input.theme,
      question_count: input.question_count,
      status: input.status ?? 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
