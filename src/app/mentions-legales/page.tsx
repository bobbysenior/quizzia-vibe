export default function MentionsLegalesPage() {
  return (
    <main className="py-16 px-8 max-w-[780px] mx-auto max-sm:py-10 max-sm:px-5">
      <div className="mb-10">
        <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
          Informations légales
        </div>
        <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-3">
          Mentions légales
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        {/* Éditeur */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Éditeur du site</h2>
          <p className="text-muted leading-relaxed">
            Le site <strong className="text-ink">Quizia</strong> est édité dans le cadre d&apos;un projet pédagogique.
          </p>
        </section>

        {/* Hébergement */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Hébergement</h2>
          <p className="text-muted leading-relaxed">
            L&apos;hébergement du site est assuré par les infrastructures du projet. Les données sont traitées et stockées conformément aux réglementations en vigueur.
          </p>
        </section>

        {/* Données personnelles */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Données personnelles</h2>
          <p className="text-muted leading-relaxed">
            Les données collectées (adresse e-mail, quiz créés, scores) sont utilisées uniquement pour le fonctionnement du service. Aucune donnée n&apos;est revendue à des tiers. Vous pouvez demander la suppression de vos données à tout moment en nous contactant.
          </p>
        </section>

        {/* Cookies */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Cookies</h2>
          <p className="text-muted leading-relaxed">
            Le site utilise des cookies techniques nécessaires à l&apos;authentification et au bon fonctionnement de l&apos;application. Aucun cookie publicitaire ou de traçage tiers n&apos;est déposé.
          </p>
        </section>

        {/* Propriété intellectuelle */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Propriété intellectuelle</h2>
          <p className="text-muted leading-relaxed">
            L&apos;ensemble des éléments graphiques, textuels et du code source du site sont la propriété exclusive de l&apos;équipe Quizia. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
          </p>
        </section>

        {/* Contact */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Contact</h2>
          <p className="text-muted leading-relaxed">
            Pour toute question relative aux mentions légales ou au fonctionnement du site, vous pouvez nous contacter via les canaux mis à disposition sur la plateforme.
          </p>
        </section>
      </div>
    </main>
  );
}
