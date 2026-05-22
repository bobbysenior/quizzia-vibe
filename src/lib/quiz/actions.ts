'use server';

import { createQuiz, createEmptyQuestions } from '@/lib/services/quizzes.service';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function checkAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { email: user?.email ?? null, userId: user?.id ?? null };
}

import { getQuizForEdit } from '@/lib/services/quizzes.service';

export async function loadQuizForEdit(quizId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notFound: true as const };

  const data = await getQuizForEdit(quizId, user.id);
  if (!data) return { notFound: true as const };

  return { notFound: false as const, quiz: data.quiz, questions: data.questions };
}

const createQuizSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  theme: z.string().min(1, 'Le thème est obligatoire'),
  question_count: z.coerce.number().int().min(5, 'Minimum 5 questions').max(30, 'Maximum 30 questions'),
});

export async function createQuizAction(_prevState: unknown, formData: FormData) {
  const parsed = createQuizSchema.safeParse({
    title: formData.get('title'),
    theme: formData.get('theme'),
    question_count: formData.get('question_count'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let quiz;
  try {
    quiz = await createQuiz({
      title: parsed.data.title,
      theme: parsed.data.theme,
      question_count: parsed.data.question_count,
    });

    await createEmptyQuestions(quiz.id, parsed.data.question_count);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur lors de la création du quiz.';
    return { error: message };
  }

  redirect(`/quizzes/${quiz.id}/edit`);
}

// --- Edition ---

import {
  updateQuiz,
  upsertQuestion,
  deleteQuestion,
  upsertChoice,
  deleteChoice,
  setCorrectChoice,
} from '@/lib/services/quizzes.service';
import { createClient } from '@/lib/supabase/server';

export async function updateQuizTitle(
  quizId: string,
  _prevState: unknown,
  formData: FormData
) {
  const title = formData.get('title') as string;
  const theme = formData.get('theme') as string;
  if (!title || !theme) return { error: 'Titre et thème sont obligatoires.' };

  try {
    await updateQuiz(quizId, { title, theme });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function saveQuestionAction(
  quizId: string,
  _prevState: unknown,
  formData: FormData
) {
  const id = (formData.get('id') as string) || undefined;
  const question_text = formData.get('question_text') as string;
  const order_index = parseInt(formData.get('order_index') as string) || 0;

  if (!question_text) return { error: 'La question est obligatoire.' };

  try {
    const result = await upsertQuestion(quizId, { id, question_text, order_index });
    return { success: true, questionId: result.id };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function deleteQuestionAction(_prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'ID manquant.' };

  try {
    await deleteQuestion(id);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function saveChoiceAction(
  questionId: string,
  _prevState: unknown,
  formData: FormData
) {
  const id = (formData.get('id') as string) || undefined;
  const choice_text = formData.get('choice_text') as string;
  const is_correct = formData.get('is_correct') === 'true';
  const order_index = parseInt(formData.get('order_index') as string) || 0;

  if (!choice_text) return { error: 'Le choix est obligatoire.' };

  try {
    const result = await upsertChoice(questionId, { id, choice_text, is_correct, order_index });
    return { success: true, choiceId: result.id };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function deleteChoiceAction(_prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'ID manquant.' };

  try {
    await deleteChoice(id);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function setCorrectChoiceAction(_prevState: unknown, formData: FormData) {
  const questionId = formData.get('question_id') as string;
  const choiceId = formData.get('choice_id') as string;

  try {
    await setCorrectChoice(questionId, choiceId);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

// --- Mes quiz : publier / archiver / supprimer ---

import { updateQuizStatus, deleteQuiz } from '@/lib/services/quizzes.service';

export async function publishQuizAction(quizId: string) {
  try {
    await updateQuizStatus(quizId, 'published');
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function archiveQuizAction(quizId: string) {
  try {
    await updateQuizStatus(quizId, 'archived');
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

export async function deleteQuizAction(quizId: string) {
  try {
    await deleteQuiz(quizId);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}

interface ChoiceInput {
  choice_text: string;
  is_correct: boolean;
  order_index: number;
}

interface QuestionInput {
  question_text: string;
  order_index: number;
  choices: ChoiceInput[];
}

export async function saveFullQuizAction(
  quizId: string,
  _prevState: unknown,
  formData: FormData
) {
  const title = formData.get('title') as string;
  const theme = formData.get('theme') as string;
  const questionsJson = formData.get('questions') as string;

  if (!title?.trim() || !theme?.trim()) return { error: 'Titre et thème sont obligatoires.' };

  let questions: QuestionInput[] = [];
  try {
    questions = JSON.parse(questionsJson || '[]');
  } catch {
    return { error: 'Données des questions invalides.' };
  }

  const filtered = questions.filter((q) => q.question_text.trim());
  if (filtered.length < 1) return { error: 'Au moins une question est obligatoire.' };

  try {
    const supabase = await createClient();

    await supabase
      .from('quizzes')
      .update({ title: title.trim(), theme: theme.trim(), question_count: filtered.length, updated_at: new Date().toISOString() })
      .eq('id', quizId);

    await supabase.from('questions').delete().eq('quiz_id', quizId);

    const questionRows = filtered.map((q, i) => ({
      quiz_id: quizId,
      question_text: q.question_text.trim(),
      order_index: i + 1,
    }));

    const { data: created, error: qError } = await supabase
      .from('questions')
      .insert(questionRows)
      .select('id');

    if (qError) throw new Error(qError.message);
    if (!created || created.length !== filtered.length) {
      throw new Error('Échec de création des questions.');
    }

    const allChoiceRows = created.flatMap((q, qi) => {
      const input = filtered[qi];
      return input.choices
        .filter((c) => c.choice_text.trim())
        .map((c, ci) => ({
          question_id: q.id,
          choice_text: c.choice_text.trim(),
          is_correct: c.is_correct,
          order_index: ci,
        }));
    });

    if (allChoiceRows.length > 0) {
      const { error: cError } = await supabase.from('choices').insert(allChoiceRows);
      if (cError) throw new Error(cError.message);
    }

    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur.';
    return { error: message };
  }
}
