import { z } from 'zod';
import { getCerebrasClient } from './cerebras';

export const reviewChoiceSchema = z.object({
  choice_text: z.string().min(1),
  is_correct: z.boolean(),
});

export const reviewQuestionSchema = z.object({
  question_text: z.string().min(1),
  choices: z.array(reviewChoiceSchema).min(2).max(6),
});

export const reviewQuizSchema = z.object({
  title: z.string().min(1),
  theme: z.string().min(1),
  questions: z.array(reviewQuestionSchema).min(1),
});

export type ReviewQuizInput = z.infer<typeof reviewQuizSchema>;
export type ReviewQuizOutput = ReviewQuizInput;

const SYSTEM_PROMPT = `Tu es un correcteur expert chargé de relire et corriger un quiz éducatif en français. Tu reçois un quiz au format JSON et tu dois retourner une version corrigée au même format JSON.

OBJECTIFS DE CORRECTION :
1. Vérifier l'exactitude factuelle de chaque question et de la réponse marquée correcte. Si la bonne réponse est mauvaise, corrige-la (déplace is_correct: true sur la vraie bonne réponse) ou reformule le choix incorrect.
2. Corriger l'orthographe, la grammaire, la ponctuation et la typographie française (espaces insécables avant ? ! : ;, guillemets « », apostrophes typographiques).
3. Reformuler les questions ambiguës pour qu'elles aient une seule interprétation possible.
4. Vérifier que chaque question a EXACTEMENT UNE réponse correcte (is_correct: true). Si plusieurs choix sont marqués corrects ou aucun, corrige.
5. S'assurer que les choix sont mutuellement exclusifs et plausibles (pas de doublons, pas de choix manifestement absurdes).
6. Améliorer le titre et le thème si ils sont vagues ou peu descriptifs.
7. NE PAS ajouter ni supprimer de questions. Conserver le même nombre exact de questions et le même ordre.
8. NE PAS modifier le nombre de choix d'une question, sauf si tu dois supprimer un doublon évident.

CONTRAINTES DE FORMAT :
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après.
- Garde la même structure : { title, theme, questions: [{ question_text, choices: [{ choice_text, is_correct }] }] }.
- Toute la sortie doit être en français.

EXEMPLE DE SORTIE :
{
  "title": "Titre corrigé",
  "theme": "Thème",
  "questions": [
    {
      "question_text": "Question corrigée ?",
      "choices": [
        { "choice_text": "Bonne réponse", "is_correct": true },
        { "choice_text": "Distracteur", "is_correct": false }
      ]
    }
  ]
}`;

export async function reviewQuizWithAI(input: ReviewQuizInput): Promise<ReviewQuizOutput> {
  const cerebras = getCerebrasClient();

  const userMessage = `Voici le quiz à corriger :\n\n${JSON.stringify(input, null, 2)}`;

  const response = await cerebras.chat.completions.create({
    model: process.env.CEREBRAS_MODEL ?? 'gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const choice = (response as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0];
  const raw = choice?.message?.content;
  if (!raw) {
    throw new Error("L'IA n'a pas retourné de correction.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("L'IA a retourné un JSON invalide.");
  }

  const result = reviewQuizSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Le JSON corrigé ne respecte pas le format attendu : ${errors}`);
  }

  if (result.data.questions.length !== input.questions.length) {
    throw new Error("L'IA a modifié le nombre de questions.");
  }

  return result.data;
}
