import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewQuizWithAI, reviewQuizSchema } from '@/lib/ai/review-quiz';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  const { data: quiz, error: ownerError } = await supabase
    .from('quizzes')
    .select('creator_id')
    .eq('id', quizId)
    .single();

  if (ownerError || !quiz) {
    return NextResponse.json({ error: 'Quiz introuvable.' }, { status: 404 });
  }
  if (quiz.creator_id !== user.id) {
    return NextResponse.json({ error: "Vous n'êtes pas le propriétaire de ce quiz." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = reviewQuizSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Quiz invalide.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const corrected = await reviewQuizWithAI(parsed.data);
    return NextResponse.json({ quiz: corrected }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur interne.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
