import { z } from "zod";
import { getCerebrasClient } from "./cerebras";

export const llmChoiceSchema = z.object({
    choice_text: z.string().min(1),
    is_correct: z.boolean(),
});

export const llmQuestionSchema = z.object({
    question_text: z.string().min(1),
    choices: z
        .array(llmChoiceSchema)
        .min(2, "Chaque question doit avoir au moins 2 choix")
        .max(6, "Chaque question doit avoir au maximum 6 choix"),
});

export const llmQuizSchema = z.object({
    title: z.string().min(1),
    theme: z.string().min(1),
    questions: z.array(llmQuestionSchema).min(1),
});

export type LLMQuizOutput = z.infer<typeof llmQuizSchema>;

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la création de quiz éducatifs. Tu dois générer un quiz en français sous forme de JSON structuré, à partir d'une description textuelle fournie par l'utilisateur.

RÈGLES STRICTES :
1. Chaque question doit avoir exactement UNE réponse correcte (is_correct: true), les autres sont fausses (is_correct: false).
2. Chaque question doit avoir entre 2 et 6 choix possibles.
3. Les choix doivent être formulés de façon claire et sans ambiguïté.
4. Le titre (title) doit être concis et descriptif.
5. Le thème (theme) doit être un mot ou une courte expression qui catégorise le quiz.
6. Les questions doivent être variées et couvrir différents aspects du sujet.
7. La difficulté doit être adaptée à un public adulte avec un niveau de culture générale.
8. Toute la sortie doit être en français.

FORMAT DE SORTIE — Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :

{
  "title": "Titre du quiz",
  "theme": "Thème",
  "questions": [
    {
      "question_text": "Texte de la question ?",
      "choices": [
        { "choice_text": "Option A", "is_correct": false },
        { "choice_text": "Option B", "is_correct": true },
        { "choice_text": "Option C", "is_correct": false }
      ]
    }
  ]
}`;

export async function generateQuizWithAI(
    prompt: string,
    minQuestions: number,
    maxQuestions: number,
): Promise<LLMQuizOutput> {
    const cerebras = getCerebrasClient();

    const userMessage = `Génère un quiz avec EXACTEMENT entre ${minQuestions} et ${maxQuestions} questions. Le nombre de questions DOIT être entre ${minQuestions} et ${maxQuestions}. Ne dépasse pas cette limite.

Description du quiz souhaité : ${prompt}`;

    const response = await cerebras.chat.completions.create({
        model: process.env.CEREBRAS_MODEL ?? "gpt-oss-120b",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
    });

    const choice = (
        response as { choices?: Array<{ message?: { content?: string } }> }
    ).choices?.[0];
    const raw = choice?.message?.content;
    if (!raw) {
        throw new Error("L'IA n'a pas généré de réponse.");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("L'IA a retourné un JSON invalide.");
    }

    const result = llmQuizSchema.safeParse(parsed);
    if (!result.success) {
        const errors = result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        throw new Error(
            `Le JSON généré ne respecte pas le format attendu : ${errors}`,
        );
    }

    let { questions } = result.data;

    if (questions.length > maxQuestions) {
        console.warn(
            `generateQuizWithAI: LLM a généré ${questions.length} questions, tronqué à ${maxQuestions}`,
        );
        questions = questions.slice(0, maxQuestions);
    }

    if (questions.length < minQuestions) {
        console.warn(
            `generateQuizWithAI: LLM a généré ${questions.length} questions, attendu min ${minQuestions}`,
        );
    }

    if (questions.length === 0) {
        throw new Error("L'IA n'a généré aucune question.");
    }

    return {
        ...result.data,
        questions: questions.map((q) => ({
            ...q,
            choices: shuffle(q.choices),
        })),
    };
}

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
