import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { tasks } from '@trigger.dev/sdk/v3';

const requestSchema = z.object({
  prompt: z.string().min(5, 'Le prompt doit faire au moins 5 caractères'),
  min_questions: z.coerce.number().int().min(1).max(30),
  max_questions: z.coerce.number().int().min(1).max(30),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Données invalides.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (parsed.data.min_questions > parsed.data.max_questions) {
    return NextResponse.json(
      { error: 'min_questions doit être inférieur ou égal à max_questions.' },
      { status: 400 }
    );
  }

  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        creator_id: user.id,
        title: 'Génération en cours…',
        theme: parsed.data.prompt.slice(0, 80),
        question_count: parsed.data.min_questions > 0 ? parsed.data.min_questions : 5,
        status: 'draft',
      })
      .select()
      .single();

    if (quizError) throw new Error(quizError.message);

    try {
      await tasks.trigger("generate-quiz", {
        quizId: quiz.id,
        prompt: parsed.data.prompt,
        minQuestions: parsed.data.min_questions,
        maxQuestions: parsed.data.max_questions,
      });
    } catch (triggerError) {
      console.error('Trigger.dev non disponible, fallback synchrone', triggerError);
      const { generateQuizWithAI } = await import('@/lib/ai/generate-quiz');
      const { createQuizFromLLM } = await import('@/lib/ai/create-quiz-from-llm');
      const llmQuiz = await generateQuizWithAI(
        parsed.data.prompt,
        parsed.data.min_questions,
        parsed.data.max_questions
      );
      await createQuizFromLLM(llmQuiz, user.id, quiz.id);
    }

    return NextResponse.json({ quizId: quiz.id }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur interne.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
