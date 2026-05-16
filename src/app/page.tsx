function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-sm font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">
          Intelligence Artificielle
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
          Des quizz qui
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-white">
            vous ressemblent
          </span>
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Générez des quizz intelligents en quelques secondes. Partagez-les,
          mesurez vos progrès, et apprenez sans effort.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/quizzes"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Explorer les quizz
          </a>
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Créer un compte →
          </a>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    label: "Parcourir",
    title: "Des quizz pour tous les goûts.",
    description:
      "Explorez une bibliothèque de quizz créés par la communauté. Aucun compte requis pour commencer à jouer.",
  },
  {
    label: "Créer",
    title: "L'IA comme co-auteur.",
    description:
      "Choisissez un thème, un nombre de questions, et laissez l'IA générer un quizz sur mesure. Vous gardez le contrôle éditorial.",
  },
  {
    label: "Progresser",
    title: "Vos stats, simplement.",
    description:
      "Score moyen, historique des parties, quizz créés et archivés : tout votre parcours en un coup d'œil.",
  },
];

function Features() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-5xl mx-auto grid gap-16 sm:gap-24">
        {features.map((f) => (
          <div
            key={f.label}
            className="grid sm:grid-cols-[120px_1fr] gap-6 sm:gap-12 items-start"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 sm:pt-2">
              {f.label}
            </p>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {f.title}
              </h2>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-12 border-t border-zinc-100 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400 dark:text-zinc-500">
        <p>Quizz — Apprenez sans friction.</p>
        <nav className="flex gap-6">
          <a href="/quizzes" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Explorer
          </a>
          <a href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Connexion
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Footer />
    </>
  );
}
