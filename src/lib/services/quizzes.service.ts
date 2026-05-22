import { createClient } from '@/lib/supabase/server';
import type { Quiz, QuizWithCount, QuizStatus } from '@/lib/types';

export interface QuizQuestion {
  id: string;
  question_text: string;
  order_index: number;
  choices: { id: string; choice_text: string; order_index: number }[];
}

export interface QuizAttemptPlay {
  id: string;
  quiz_id: string;
  status: 'in_progress' | 'completed';
  total_questions: number;
  score: number | null;
}

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

export async function updateQuiz(
  quizId: string,
  input: { title?: string; theme?: string }
): Promise<Quiz> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Non autorisé.');

  const { data, error } = await supabase
    .from('quizzes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', quizId)
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertQuestion(
  quizId: string,
  question: { id?: string; question_text: string; order_index: number }
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  if (question.id) {
    const { data, error } = await supabase
      .from('questions')
      .update({ question_text: question.question_text })
      .eq('id', question.id)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({ quiz_id: quizId, question_text: question.question_text, order_index: question.order_index })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);
  if (error) throw new Error(error.message);
}

export async function upsertChoice(
  questionId: string,
  choice: { id?: string; choice_text: string; is_correct: boolean; order_index: number }
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  if (choice.id) {
    const { data, error } = await supabase
      .from('choices')
      .update({ choice_text: choice.choice_text, is_correct: choice.is_correct })
      .eq('id', choice.id)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('choices')
    .insert({
      question_id: questionId,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: choice.order_index,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteChoice(choiceId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  const { error } = await supabase
    .from('choices')
    .delete()
    .eq('id', choiceId);
  if (error) throw new Error(error.message);
}

export async function setCorrectChoice(questionId: string, choiceId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  await supabase.from('choices').update({ is_correct: false }).eq('question_id', questionId);
  const { error } = await supabase
    .from('choices')
    .update({ is_correct: true })
    .eq('id', choiceId)
    .eq('question_id', questionId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Play functions
// ---------------------------------------------------------------

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, order_index, choices(id, choice_text, order_index)')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })
    .order('order_index', { referencedTable: 'choices', ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as QuizQuestion[];
}

export async function createQuizAttempt(
  quizId: string,
  totalQuestions: number
): Promise<QuizAttemptPlay> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: user?.id ?? null,
      status: 'in_progress',
      total_questions: totalQuestions,
    })
    .select('id, quiz_id, status, total_questions, score')
    .single();

  if (error) throw new Error(error.message);
  return data as QuizAttemptPlay;
}

export async function getExistingAttempt(attemptId: string): Promise<QuizAttemptPlay | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, status, total_questions, score')
    .eq('id', attemptId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as QuizAttemptPlay;
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  choiceId: string
): Promise<{ isCorrect: boolean; answeredQuestionIds: string[] }> {
  const supabase = await createClient();

  const { data: choice, error: choiceError } = await supabase
    .from('choices')
    .select('is_correct')
    .eq('id', choiceId)
    .single();

  if (choiceError) throw new Error(choiceError.message);

  const { error: insertError } = await supabase.from('user_answers').insert({
    attempt_id: attemptId,
    question_id: questionId,
    selected_choice_id: choiceId,
    is_correct: choice.is_correct,
  });

  if (insertError) throw new Error(insertError.message);

  const { data: answers } = await supabase
    .from('user_answers')
    .select('question_id')
    .eq('attempt_id', attemptId);

  return {
    isCorrect: choice.is_correct,
    answeredQuestionIds: (answers ?? []).map((a) => a.question_id),
  };
}

export async function completeAttempt(
  attemptId: string
): Promise<{ score: number; total: number }> {
  const supabase = await createClient();

  const { data: answers, error: countError } = await supabase
    .from('user_answers')
    .select('is_correct')
    .eq('attempt_id', attemptId);

  if (countError) throw new Error(countError.message);

  const score = (answers ?? []).filter((a) => a.is_correct).length;
  const total = (answers ?? []).length;

  const { error: updateError } = await supabase
    .from('quiz_attempts')
    .update({ status: 'completed', score, completed_at: new Date().toISOString() })
    .eq('id', attemptId);

  if (updateError) throw new Error(updateError.message);

  return { score, total };
}

export interface QuizQuestionWithChoices {
  id: string;
  question_text: string;
  order_index: number;
  choices: { id: string; choice_text: string; is_correct: boolean; order_index: number }[];
}

export async function getQuizForEdit(
  quizId: string,
  userId: string
): Promise<{ quiz: Quiz; questions: QuizQuestionWithChoices[] } | null> {
  const supabase = await createClient();

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .eq('creator_id', userId)
    .single();

  if (quizError) {
    if (quizError.code === 'PGRST116') return null;
    throw new Error(quizError.message);
  }

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, question_text, order_index, choices(id, choice_text, is_correct, order_index)')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })
    .order('order_index', { referencedTable: 'choices', ascending: true });

  if (questionsError) throw new Error(questionsError.message);

  return { quiz, questions: (questions ?? []) as unknown as QuizQuestionWithChoices[] };
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

export async function createEmptyQuestions(quizId: string, count: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé.');

  const questionRows = Array.from({ length: count }, (_, i) => ({
    quiz_id: quizId,
    question_text: 'Nouvelle question',
    order_index: i + 1,
  }));

  const { data: questions, error: qError } = await supabase
    .from('questions')
    .insert(questionRows)
    .select('id');

  if (qError) throw new Error(qError.message);
  if (!questions || questions.length !== count) {
    throw new Error('Échec de création des questions.');
  }

  const LABELS = ['Choix A', 'Choix B', 'Choix C', 'Choix D'];
  const choiceRows = questions.flatMap((q) =>
    LABELS.map((label, ci) => ({
      question_id: q.id,
      choice_text: label,
      is_correct: false,
      order_index: ci,
    }))
  );

  const { error: cError } = await supabase.from('choices').insert(choiceRows);
  if (cError) throw new Error(cError.message);
}
