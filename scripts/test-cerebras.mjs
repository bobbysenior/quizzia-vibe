import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const content = readFileSync(path, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

// .env.local prend le pas sur .env (comme Next)
const env = { ...loadEnv(resolve(root, '.env')), ...loadEnv(resolve(root, '.env.local')) };
const apiKey = env.CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY;
const model = env.CEREBRAS_MODEL || process.env.CEREBRAS_MODEL || 'gpt-oss-120b';

if (!apiKey) {
  console.error('❌ CEREBRAS_API_KEY manquante (.env.local ou variable d\'environnement).');
  process.exit(1);
}

console.log(`→ Modèle : ${model}`);
console.log('→ Envoi d\'un prompt de test à Cerebras…\n');

const client = new Cerebras({ apiKey });

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la création de quiz éducatifs. Tu dois générer un quiz en français sous forme de JSON structuré.

RÈGLES :
1. Exactement UNE réponse correcte par question (is_correct: true).
2. Entre 2 et 6 choix par question.
3. Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :

{
  "title": "...",
  "theme": "...",
  "questions": [
    { "question_text": "...", "choices": [ { "choice_text": "...", "is_correct": false } ] }
  ]
}`;

const t0 = Date.now();
let response;
try {
  response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Génère un quiz de 3 questions sur la capitale des pays européens.' },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
} catch (err) {
  console.error('❌ Appel Cerebras échoué :', err?.message ?? err);
  process.exit(1);
}
const elapsed = Date.now() - t0;

const raw = response?.choices?.[0]?.message?.content;
if (!raw) {
  console.error('❌ Réponse vide.');
  console.error(JSON.stringify(response, null, 2));
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error('❌ JSON invalide retourné par le modèle :\n', raw);
  process.exit(1);
}

console.log(`✅ Réponse reçue en ${elapsed} ms\n`);
console.log(JSON.stringify(parsed, null, 2));

const ok =
  typeof parsed.title === 'string' &&
  typeof parsed.theme === 'string' &&
  Array.isArray(parsed.questions) &&
  parsed.questions.length > 0 &&
  parsed.questions.every(
    (q) =>
      typeof q.question_text === 'string' &&
      Array.isArray(q.choices) &&
      q.choices.length >= 2 &&
      q.choices.filter((c) => c.is_correct === true).length === 1,
  );

if (!ok) {
  console.error('\n⚠️  Le JSON ne respecte pas le schéma attendu (title/theme/questions[].choices[] + 1 correct).');
  process.exit(1);
}

console.log('\n✅ Schéma OK — la communication avec Cerebras fonctionne.');
