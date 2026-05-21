import Link from 'next/link';
import { listQuizzes } from '@/lib/services/quizzes.service';

function Marquee() {
  return (
    <div className="mt-20 py-6 border-t border-line-2 border-b flex justify-around flex-wrap gap-10 text-center">
      {[
        ['2,4M', 'quiz joués'],
        ['187k', 'quiz créés'],
        ['12s', 'génération moyenne'],
        ['94%', 'satisfaction'],
      ].map(([num, lbl]) => (
        <div key={lbl}>
          <div className="text-4xl font-semibold tracking-[-0.025em]">{num}</div>
          <div className="text-[13px] text-muted font-mono uppercase tracking-[0.05em]">{lbl}</div>
        </div>
      ))}
    </div>
  );
}

function LivePreview() {
  const answers: [string, string, boolean][] = [
    ['A', 'Quentin Tarantino', false],
    ['B', 'Bong Joon-ho', true],
    ['C', 'Pedro Almodóvar', false],
    ['D', 'Céline Sciamma', false],
  ];

  return (
    <div className="relative mt-[72px] perspective-[1600px]">
      <div className="w-[min(900px,100%)] mx-auto bg-bg-elev rounded-[28px] border border-line-2 shadow-[0_30px_80px_rgba(0,0,0,0.12),0_6px_14px_rgba(0,0,0,0.04)] overflow-hidden rotate-x-[2deg]">
        <div className="flex items-center gap-2 px-4 py-3 bg-bg-soft border-b border-line-2">
          <span className="w-[11px] h-[11px] rounded-full bg-[#fc6058]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#fdbc40]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#34c84a]" />
          <span className="ml-4 font-mono text-xs text-muted">quizia.app / quiz / l-histoire-du-cinema</span>
        </div>
        <div className="p-10 min-h-[380px] grid gap-7">
          <div className="flex justify-between items-center font-mono text-xs text-muted">
            <span>Question 6 / 10</span>
            <div className="flex-1 h-1 bg-line-2 rounded-full overflow-hidden mx-4">
              <div className="h-full w-[60%] bg-ink rounded-full" />
            </div>
            <span>02:14</span>
          </div>
          <div className="text-[28px] font-semibold tracking-[-0.02em] leading-tight">
            Quel réalisateur a remporté la Palme d&apos;Or en 2019 ?
          </div>
          <div className="grid grid-cols-2 gap-3">
            {answers.map(([key, text, correct]) => (
              <button
                key={key}
                className={`text-left bg-bg-elev border rounded-2xl px-4 py-4 text-[15px] flex items-center gap-3 transition hover:border-ink hover:-translate-y-px ${
                  correct
                    ? 'border-good bg-[oklch(96%_0.06_150)]'
                    : 'border-line'
                }`}
              >
                <span
                  className={`w-[26px] h-[26px] rounded-lg bg-bg-soft text-muted flex items-center justify-center font-mono text-xs font-medium transition ${
                    correct ? 'bg-good text-white' : ''
                  }`}
                >
                  {key}
                </span>
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const themeGradients = [
  'bg-[linear-gradient(135deg,oklch(75%_0.18_280),oklch(85%_0.14_240))]',
  'bg-[linear-gradient(135deg,oklch(80%_0.16_60),oklch(85%_0.16_30))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.14_150),oklch(85%_0.12_180))]',
  'bg-[linear-gradient(135deg,oklch(72%_0.2_340),oklch(80%_0.18_20))]',
  'bg-[linear-gradient(135deg,oklch(75%_0.14_220),oklch(85%_0.1_260))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.15_110),oklch(85%_0.12_80))]',
];

export default async function Home() {
  const quizzes = await listQuizzes();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-8 text-center overflow-hidden">
        <div className="absolute inset-x-[-10%] top-[-10%] h-[720px] z-0 pointer-events-none opacity-85 blur-[40px] bg-[radial-gradient(40%_50%_at_20%_30%,oklch(85%_0.13_290_/_0.6),transparent_70%),radial-gradient(40%_50%_at_80%_20%,oklch(88%_0.1_200_/_0.5),transparent_70%),radial-gradient(50%_60%_at_50%_70%,oklch(92%_0.08_60_/_0.55),transparent_70%)]" />
        <div className="relative z-10 max-w-[1100px] mx-auto">
          <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-7">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle -translate-y-px" />
            Génération IA · Disponible maintenant
          </div>
          <h1 className="text-[clamp(48px,8.2vw,104px)] leading-[0.98] tracking-[-0.04em] font-semibold mb-6">
            Des quiz, <br />
            <span className="bg-[linear-gradient(120deg,var(--color-ink)_30%,var(--color-accent)_50%,var(--color-ink)_70%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shine">
              générés en quelques secondes.
            </span>
          </h1>
          <p className="text-[clamp(18px,1.7vw,22px)] text-ink-2 max-w-[640px] mx-auto mb-10 leading-[1.45]">
            Décrivez un sujet. Choisissez un nombre de questions. Quizia compose le quiz, vous le relisez, vous le partagez. C&apos;est tout.
          </p>
          <div className="inline-flex gap-3 flex-wrap justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition"
            >
              Commencer gratuitement <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#bibliotheque"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-line text-ink text-base font-medium hover:bg-bg-soft hover:border-ink transition"
            >
              Parcourir les quiz
            </Link>
          </div>
        </div>
        <LivePreview />
        <Marquee />
      </section>

      {/* How it works */}
      <section className="py-[120px] px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-[720px] mx-auto mb-14">
            <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
              Comment ça marche
            </div>
            <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.028em] leading-[1.08] mb-5">
              Trois étapes. Aucune friction.
            </h2>
            <p className="text-[clamp(18px,1.7vw,22px)] text-ink-2 leading-[1.45]">
              De l&apos;idée au quiz publié, en moins d&apos;une minute. L&apos;IA s&apos;occupe du reste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                n: '01 — Saisir',
                title: 'Un sujet, un nombre de questions.',
                desc: 'Entre 5 et 30 questions. Pas de templates, pas de formulaires interminables.',
                visual: (
                  <div className="w-[80%] bg-bg-elev border border-line rounded-[10px] py-2.5 px-3.5 font-mono text-[13px] text-ink-2 relative after:content-[''] after:inline-block after:w-[7px] after:h-[14px] after:bg-ink after:align-[-3px] after:ml-0.5 after:animate-[blink_1s_steps(1)_infinite]">
                    Donne-moi un quiz sur la cuisine italienne
                  </div>
                ),
              },
              {
                n: '02 — Générer',
                title: "L'IA compose le quiz.",
                desc: 'Questions, réponses, bonne option. Vous relisez, vous ajustez, vous validez.',
                visual: (
                  <div className="w-16 h-16 rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),oklch(75%_0.2_320),oklch(80%_0.15_200),var(--color-accent))] animate-[spin_4s_linear_infinite] shadow-[0_0_40px_oklch(70%_0.2_280_/_0.4)]" />
                ),
              },
              {
                n: '03 — Partager',
                title: 'Publier ou garder pour soi.',
                desc: "Un lien suffit. Les joueurs n'ont besoin d'aucun compte pour participer.",
                visual: (
                  <span className="font-mono text-xs bg-ink text-white py-2.5 px-4 rounded-[10px] inline-flex items-center gap-2">
                    <span className="text-muted-2">quizia.app/</span>cuisine-italienne
                  </span>
                ),
              },
            ].map((step) => (
              <div
                key={step.n}
                className="bg-bg-elev border border-line-2 rounded-[22px] p-8 flex flex-col gap-4 min-h-[280px] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
              >
                <div className="h-[120px] rounded-2xl bg-bg-soft flex items-center justify-center overflow-hidden">
                  {step.visual}
                </div>
                <span className="font-mono text-xs text-muted">{step.n}</span>
                <h3 className="text-[22px] font-semibold tracking-[-0.018em] mt-auto">{step.title}</h3>
                <p className="text-ink-2 text-[15px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Library */}
      <section id="bibliotheque" className="bg-bg-soft pt-24 pb-[120px] px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
            <div>
              <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
                Bibliothèque publique
              </div>
              <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.028em] leading-[1.08]">
                Des centaines de quiz, prêts à jouer.
              </h2>
            </div>
            <Link
              href="/quizzes"
              className="text-accent-ink font-medium inline-flex items-center gap-1 text-base hover:[&_span]:translate-x-1"
            >
              Tout explorer <span className="transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz, i) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="group bg-bg-elev border border-line-2 rounded-[22px] p-6 flex flex-col min-h-[220px] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-line"
              >
                <div
                  className={`h-[90px] rounded-2xl -mx-6 -mt-6 mb-5 relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(40%_60%_at_70%_30%,rgba(255,255,255,0.5),transparent_60%),radial-gradient(50%_60%_at_20%_80%,rgba(0,0,0,0.15),transparent_60%)] ${themeGradients[i % themeGradients.length]}`}
                >
                  <span className="absolute right-4 bottom-3 font-mono text-[11px] text-black/45 uppercase tracking-[0.08em]">
                    {quiz.theme}
                  </span>
                </div>
                <h3 className="text-[19px] font-semibold tracking-[-0.02em] leading-[1.25] mb-2">{quiz.title}</h3>
                <div className="flex gap-2 mt-auto">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-[0.04em] px-2 py-1 rounded-full bg-bg-soft text-ink-2">
                    {quiz.question_count} Q
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-soft text-ink-2">
                    {quiz.theme}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="mx-8 bg-ink text-white rounded-[32px] py-20 px-16 text-center relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(40%_60%_at_80%_20%,oklch(60%_0.22_280_/_0.4),transparent_70%),radial-gradient(40%_60%_at_20%_80%,oklch(70%_0.2_200_/_0.3),transparent_70%)]">
          <div className="relative">
            <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-white/65 mb-5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 align-middle" />
              Gratuit, sans carte bancaire
            </div>
            <h2 className="text-[clamp(36px,5vw,64px)] font-semibold tracking-[-0.035em] leading-[1.02] mb-4">
              Créez votre premier quiz
              <br />
              en moins d&apos;une minute.
            </h2>
            <p className="text-white/70 max-w-[540px] mx-auto mb-8 text-[clamp(18px,1.7vw,22px)] leading-[1.45]">
              Inscrivez-vous, décrivez votre sujet, laissez l&apos;IA composer. Vous gardez le dernier mot sur chaque question.
            </p>
            <div className="inline-flex gap-3 flex-wrap justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-ink text-base font-medium hover:-translate-y-px transition"
              >
                Créer mon compte <span>→</span>
              </Link>
              <Link
                href="/stats"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/25 text-white text-base font-medium hover:bg-white/10 hover:border-white transition"
              >
                Voir un exemple de tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
