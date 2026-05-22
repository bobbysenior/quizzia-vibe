import { task, logger } from "@trigger.dev/sdk/v3";
import { generateQuizWithAI } from "@/lib/ai/generate-quiz";
import { createClient } from "@supabase/supabase-js";

interface GenerateQuizPayload {
  quizId: string;
  prompt: string;
  minQuestions: number;
  maxQuestions: number;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const generateQuizTask = task({
  id: "generate-quiz",
  maxDuration: 600,
  run: async (payload: GenerateQuizPayload, { ctx }) => {
    logger.log("Début de la génération du quiz", { quizId: payload.quizId, prompt: payload.prompt });

    const llmOutput = await generateQuizWithAI(
      payload.prompt,
      payload.minQuestions,
      payload.maxQuestions
    );

    logger.log("Quiz généré par l'IA", { title: llmOutput.title, questionCount: llmOutput.questions.length });

    const supabase = getAdminClient();

    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        title: llmOutput.title,
        theme: llmOutput.theme,
        question_count: llmOutput.questions.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.quizId);

    if (updateError) throw new Error(updateError.message);

    await supabase.from("questions").delete().eq("quiz_id", payload.quizId);

    for (const [qi, q] of llmOutput.questions.entries()) {
      const { data: question, error: qError } = await supabase
        .from("questions")
        .insert({
          quiz_id: payload.quizId,
          question_text: q.question_text,
          order_index: qi,
        })
        .select("id")
        .single();

      if (qError) throw new Error(qError.message);

      for (const [ci, c] of q.choices.entries()) {
        const { error: cError } = await supabase
          .from("choices")
          .insert({
            question_id: question.id,
            choice_text: c.choice_text,
            is_correct: c.is_correct,
            order_index: ci,
          });
        if (cError) throw new Error(cError.message);
      }
    }

    logger.log("Quiz sauvegardé en base", { quizId: payload.quizId });

    return { quizId: payload.quizId, title: llmOutput.title };
  },
});
