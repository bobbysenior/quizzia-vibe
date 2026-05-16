import { createClient } from '@/lib/supabase/server';
import type { Quiz, QuizWithCount, QuizStatus } from '@/lib/types';

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
