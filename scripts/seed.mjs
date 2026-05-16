import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Parse .env manually
function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    vars[key] = value;
  }
  return vars;
}

const env = loadEnv(resolve(root, '.env'));

const supabaseUrl = env.SUPABASE_PUBLIC_URL || 'http://localhost:8000';
const serviceRoleKey = env.SERVICE_ROLE_KEY;
const anonKey = env.ANON_KEY;

if (!serviceRoleKey) {
  console.error('❌ SERVICE_ROLE_KEY non trouvé dans .env');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey);

// ----------------------------------------------------------
// Fake data
// ----------------------------------------------------------

const quizzesData = [
  {
    title: 'Les mystères de l\'univers',
    theme: 'Science',
    question_count: 5,
    status: 'published',
    questions: [
      {
        question_text: 'Quelle est la vitesse de la lumière dans le vide ?',
        choices: [
          { choice_text: '300 000 km/s', is_correct: true },
          { choice_text: '150 000 km/s', is_correct: false },
          { choice_text: '500 000 km/s', is_correct: false },
          { choice_text: '1 000 000 km/s', is_correct: false },
        ],
      },
      {
        question_text: 'Quel élément chimique a pour symbole "O" ?',
        choices: [
          { choice_text: 'Oxygène', is_correct: true },
          { choice_text: 'Or', is_correct: false },
          { choice_text: 'Osmium', is_correct: false },
          { choice_text: 'Oganesson', is_correct: false },
        ],
      },
      {
        question_text: 'Combien de planètes composent le système solaire ?',
        choices: [
          { choice_text: '8', is_correct: true },
          { choice_text: '9', is_correct: false },
          { choice_text: '7', is_correct: false },
          { choice_text: '10', is_correct: false },
        ],
      },
      {
        question_text: 'Qu\'est-ce que l\'ADN ?',
        choices: [
          { choice_text: 'Acide désoxyribonucléique', is_correct: true },
          { choice_text: 'Acide ribonucléique', is_correct: false },
          { choice_text: 'Une protéine', is_correct: false },
          { choice_text: 'Un lipide', is_correct: false },
        ],
      },
      {
        question_text: 'Quelle est la plus grande planète du système solaire ?',
        choices: [
          { choice_text: 'Jupiter', is_correct: true },
          { choice_text: 'Saturne', is_correct: false },
          { choice_text: 'Neptune', is_correct: false },
          { choice_text: 'Uranus', is_correct: false },
        ],
      },
    ],
  },
  {
    title: 'Les grandes dates de l\'Histoire',
    theme: 'Histoire',
    question_count: 5,
    status: 'published',
    questions: [
      {
        question_text: 'En quelle année a eu lieu la Révolution française ?',
        choices: [
          { choice_text: '1789', is_correct: true },
          { choice_text: '1792', is_correct: false },
          { choice_text: '1776', is_correct: false },
          { choice_text: '1804', is_correct: false },
        ],
      },
      {
        question_text: 'Qui était le premier empereur romain ?',
        choices: [
          { choice_text: 'Auguste', is_correct: true },
          { choice_text: 'Jules César', is_correct: false },
          { choice_text: 'Néron', is_correct: false },
          { choice_text: 'Tibère', is_correct: false },
        ],
      },
      {
        question_text: 'En quelle année le mur de Berlin est-il tombé ?',
        choices: [
          { choice_text: '1989', is_correct: true },
          { choice_text: '1987', is_correct: false },
          { choice_text: '1991', is_correct: false },
          { choice_text: '1990', is_correct: false },
        ],
      },
      {
        question_text: 'Quel pays a colonisé le Brésil ?',
        choices: [
          { choice_text: 'Le Portugal', is_correct: true },
          { choice_text: 'L\'Espagne', is_correct: false },
          { choice_text: 'La France', is_correct: false },
          { choice_text: 'L\'Angleterre', is_correct: false },
        ],
      },
      {
        question_text: 'Quand a commencé la Première Guerre mondiale ?',
        choices: [
          { choice_text: '1914', is_correct: true },
          { choice_text: '1912', is_correct: false },
          { choice_text: '1916', is_correct: false },
          { choice_text: '1918', is_correct: false },
        ],
      },
    ],
  },
  {
    title: 'Capitales du monde',
    theme: 'Géographie',
    question_count: 5,
    status: 'published',
    questions: [
      {
        question_text: 'Quelle est la capitale du Canada ?',
        choices: [
          { choice_text: 'Ottawa', is_correct: true },
          { choice_text: 'Toronto', is_correct: false },
          { choice_text: 'Montréal', is_correct: false },
          { choice_text: 'Vancouver', is_correct: false },
        ],
      },
      {
        question_text: 'Quelle est la capitale de l\'Australie ?',
        choices: [
          { choice_text: 'Canberra', is_correct: true },
          { choice_text: 'Sydney', is_correct: false },
          { choice_text: 'Melbourne', is_correct: false },
          { choice_text: 'Brisbane', is_correct: false },
        ],
      },
      {
        question_text: 'Quelle est la capitale du Brésil ?',
        choices: [
          { choice_text: 'Brasília', is_correct: true },
          { choice_text: 'Rio de Janeiro', is_correct: false },
          { choice_text: 'São Paulo', is_correct: false },
          { choice_text: 'Salvador', is_correct: false },
        ],
      },
      {
        question_text: 'Quelle est la capitale de la Turquie ?',
        choices: [
          { choice_text: 'Ankara', is_correct: true },
          { choice_text: 'Istanbul', is_correct: false },
          { choice_text: 'Izmir', is_correct: false },
          { choice_text: 'Bursa', is_correct: false },
        ],
      },
      {
        question_text: 'Quelle est la capitale de la Nouvelle-Zélande ?',
        choices: [
          { choice_text: 'Wellington', is_correct: true },
          { choice_text: 'Auckland', is_correct: false },
          { choice_text: 'Christchurch', is_correct: false },
          { choice_text: 'Hamilton', is_correct: false },
        ],
      },
    ],
  },
];

// ----------------------------------------------------------
// Main
// ----------------------------------------------------------

async function seed() {
  console.log('🌱 Démarrage du seed...\n');

  // 1. Create demo user via Admin API
  console.log('👤 Création du compte demo@quizz.app...');
  let userId;

  const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === 'demo@quizz.app');

  if (existing) {
    userId = existing.id;
    console.log('   ⏭️  Compte demo existant, réutilisé.');
  } else {
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: 'demo@quizz.app',
      password: 'demo123456',
      email_confirm: true,
    });

    if (createError) {
      console.error('   ❌ Erreur création utilisateur:', createError.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log('   ✅ Compte créé (demo@quizz.app / demo123456)');
  }

  // 2. Delete existing seed quizzes to avoid duplicates
  console.log('\n🧹 Nettoyage des anciens quizz de seed...');
  const { data: oldQuizzes } = await adminClient
    .from('quizzes')
    .select('id')
    .eq('creator_id', userId);
  if (oldQuizzes?.length) {
    const { error: delError } = await adminClient
      .from('quizzes')
      .delete()
      .eq('creator_id', userId);
    if (delError) console.warn('   ⚠️  Erreur suppression:', delError.message);
    else console.log(`   ✅ ${oldQuizzes.length} quizz supprimés.`);
  }

  // 3. Insert quizzes, questions, and choices
  console.log('\n📝 Création des quizz...');
  for (const q of quizzesData) {
    const { data: quiz, error: quizError } = await adminClient
      .from('quizzes')
      .insert({
        creator_id: userId,
        title: q.title,
        theme: q.theme,
        question_count: q.question_count,
        status: q.status,
      })
      .select()
      .single();

    if (quizError) {
      console.error(`   ❌ Erreur quizz "${q.title}":`, quizError.message);
      continue;
    }

    let qIndex = 0;
    for (const question of q.questions) {
      const { data: qRow, error: qError } = await adminClient
        .from('questions')
        .insert({
          quiz_id: quiz.id,
          question_text: question.question_text,
          order_index: qIndex,
        })
        .select()
        .single();

      if (qError) {
        console.error(`   ❌ Erreur question:`, qError.message);
        continue;
      }

      let cIndex = 0;
      for (const choice of question.choices) {
        const { error: cError } = await adminClient
          .from('choices')
          .insert({
            question_id: qRow.id,
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
            order_index: cIndex,
          });

        if (cError) {
          console.error(`   ❌ Erreur choix:`, cError.message);
        }
        cIndex++;
      }
      qIndex++;
    }
    console.log(`   ✅ "${q.title}" — ${q.questions.length} questions`);
  }

  // 4. Create a completed quiz attempt for the demo user
  console.log('\n🎮 Création d\'une tentative...');
  const { data: firstQuiz } = await adminClient
    .from('quizzes')
    .select('id, question_count, questions(id, choices(id, is_correct))')
    .eq('creator_id', userId)
    .limit(1)
    .single();

  if (firstQuiz) {
    const { data: attempt, error: aError } = await adminClient
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: firstQuiz.id,
        status: 'completed',
        score: 4,
        total_questions: firstQuiz.question_count,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (aError) {
      console.error('   ❌ Erreur tentative:', aError.message);
    } else {
      let correctCount = 0;
      for (const question of firstQuiz.questions) {
        const correct = question.choices.find((c) => c.is_correct);
        const wrong = question.choices.find((c) => !c.is_correct);
        const chosen = correctCount < 4 ? correct : wrong; // 4 correct, 1 wrong
        correctCount++;

        await adminClient.from('user_answers').insert({
          attempt_id: attempt.id,
          question_id: question.id,
          selected_choice_id: chosen.id,
          is_correct: chosen.is_correct,
        });
      }
      console.log('   ✅ Tentative complétée (score: 4/5)');
    }
  }

  console.log('\n✨ Seed terminé !');
  console.log('   Compte demo : demo@quizz.app / demo123456');
}

seed().catch((err) => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
