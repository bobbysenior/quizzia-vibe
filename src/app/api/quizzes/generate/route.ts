import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { generateQuizWithAI } from '@/lib/ai/generate-quiz';
import { createQuizFromLLM } from '@/lib/ai/create-quiz-from-llm';

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
    const llmQuiz = await generateQuizWithAI(
      parsed.data.prompt,
      parsed.data.min_questions,
      parsed.data.max_questions
    );

    const quiz = await createQuizFromLLM(llmQuiz, user.id);

    return NextResponse.json({ quizId: quiz.id }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur interne.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
