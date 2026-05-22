import { createClient } from '@supabase/supabase-js';
import type { LLMQuizOutput } from './generate-quiz';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function createQuizFromLLM(llmOutput: LLMQuizOutput, userId: string) {
  const supabase = getAdminClient();

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      creator_id: userId,
      title: llmOutput.title,
      theme: llmOutput.theme,
      question_count: llmOutput.questions.length,
      status: 'draft',
    })
    .select()
    .single();

  if (quizError) throw new Error(quizError.message);

  for (const [qi, q] of llmOutput.questions.entries()) {
    const { data: question, error: qError } = await supabase
      .from('questions')
      .insert({
        quiz_id: quiz.id,
        question_text: q.question_text,
        order_index: qi,
      })
      .select('id')
      .single();

    if (qError) throw new Error(qError.message);

    for (const [ci, c] of q.choices.entries()) {
      const { error: cError } = await supabase
        .from('choices')
        .insert({
          question_id: question.id,
          choice_text: c.choice_text,
          is_correct: c.is_correct,
          order_index: ci,
        });
      if (cError) throw new Error(cError.message);
    }
  }

  return quiz;
}
