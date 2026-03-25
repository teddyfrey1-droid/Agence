import Link from "next/link";

export default function AgencePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:px-8 md:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Agence</div>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Une approche de cabinet, pensée pour l’immobilier commercial.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f564c]">
            Premium Retail a été conçu autour d’une conviction simple : dans le commerce, un bon accompagnement repose autant sur la lecture fine des emplacements que sur la qualité de suivi, la mémoire collective et la vitesse d’exécution.
          </p>
        </div>

        <div className="surface-card overflow-hidden p-0">
          <div className="aspect-[4/3] bg-[linear-gradient(135deg,#ece3d8_0%,#ffffff_45%,#d4b79a_120%)]" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Block
          title="Conseil précis"
          description="Chaque recherche ou commercialisation est travaillée avec une lecture concrète des zones, des flux, des contraintes techniques et de la réalité d’exploitation."
        />
        <Block
          title="Exécution structurée"
          description="Les dossiers sont suivis dans une logique claire, avec priorités, relances, traçabilité et restitution propre."
        />
        <Block
          title="Luxe accessible"
          description="Une exécution haut de gamme ne doit pas être intimidante. L’expérience doit rassurer, clarifier et donner confiance."
        />
      </section>

      <section className="surface-card">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Expertises</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Ce que nous traitons</h2>
          </div>
          <div className="grid gap-3 text-sm text-[#5f564c] sm:grid-cols-2">
            {[
              "Locaux commerciaux",
              "Fonds de commerce",
              "Droit au bail",
              "Location pure",
              "Vente de murs",
              "Opportunités off-market",
              "Reprises d’actifs",
              "Mandats confidentiels",
            ].map((item: string) => (
              <div key={item} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Prise de contact</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Nous entrons vite dans le concret.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f564c]">
              Que vous cherchiez un local, que vous souhaitiez tester une valeur locative ou mettre un actif en commercialisation, nous privilégions une prise de besoin claire et une réponse structurée.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/recherche-local" className="rounded-2xl bg-black px-5 py-3 text-center text-sm font-medium text-white">
              Déposer une recherche
            </Link>
            <Link href="/proposer-un-bien" className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-center text-sm font-medium text-ink">
              Proposer un bien
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-card">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Positionnement</div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5f564c]">{description}</p>
    </div>
  );
}
