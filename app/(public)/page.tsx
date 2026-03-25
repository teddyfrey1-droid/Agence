import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicPropertyCard } from "@/components/public/public-property-card";

export default async function HomePage() {
  const [listingsCount, latestListings] = await Promise.all([
    prisma.listing.count({ where: { status: "PUBLISHED", visibilityScope: "PUBLIC" } }),
    prisma.listing.findMany({
      where: { status: "PUBLISHED", visibilityScope: "PUBLIC" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { property: true },
    }),
  ]);

  return (
    <div className="space-y-24 pb-24">
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#8a7e71]">
            Immobilier commercial · Paris
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-ink md:text-6xl">
            Un cabinet premium pour les emplacements qui demandent du discernement.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f564c] md:text-lg">
            Nous accompagnons enseignes, restaurateurs, investisseurs et propriétaires dans leurs
            recherches, commercialisations et arbitrages d’actifs commerciaux avec une lecture fine
            du terrain, une exécution structurée et un suivi très réactif.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/recherche-local" className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black/90">
              Déposer une recherche
            </Link>
            <Link href="/proposer-un-bien" className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]">
              Proposer un bien
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Metric label="Biens visibles" value={String(listingsCount)} />
            <Metric label="Approche" value="Sur-mesure" />
            <Metric label="Positionnement" value="Premium, accessible" />
          </div>
        </div>

        <div className="surface-card overflow-hidden p-0">
          <div className="aspect-[4/5] bg-[linear-gradient(135deg,#171717_0%,#2b241f_42%,#c4aa8f_140%)]" />
          <div className="grid gap-4 p-6">
            <div className="rounded-2xl border border-line bg-[#fbf8f4] p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Cabinet</div>
              <div className="mt-2 text-xl font-semibold tracking-tight text-ink">
                Expertises locales, suivi structuré, exécution rapide.
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm leading-7 text-[#5f564c]">
                Locaux commerciaux, fonds, droit au bail, murs, opportunités confidentielles et
                sourcing terrain : un écosystème conçu pour les dossiers exigeants.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Sélection</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              Une sélection sobre, rigoureuse et immédiatement exploitable.
            </h2>
          </div>
          <Link href="/biens" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
            Voir tous les biens
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {latestListings.length > 0 ? latestListings.map((listing: (typeof latestListings)[number]) => (
            <PublicPropertyCard
              key={listing.id}
              slug={listing.seoSlug}
              title={listing.listingTitle}
              subtitle={`${listing.property.arrondissement ?? "Paris"} · ${listing.property.neighborhood ?? "Localisation à préciser"}`}
              price={
                listing.property.monthlyRent
                  ? `${listing.property.monthlyRent.toString()} € / mois`
                  : listing.property.salePrice
                    ? `${listing.property.salePrice.toString()} €`
                    : "Sur demande"
              }
              surface={listing.property.totalArea ? `${listing.property.totalArea.toString()} m²` : "Surface à préciser"}
              extraction={
                listing.property.extractionAvailable === null
                  ? "À confirmer"
                  : listing.property.extractionAvailable
                    ? "Oui"
                    : "Non"
              }
              status={listing.status}
            />
          )) : (
            <div className="surface-card lg:col-span-3">
              <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">Le portefeuille public est prêt à être alimenté.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f564c]">
                    Dès qu’un bien est publié depuis le backoffice, il apparaîtra ici avec un rendu premium et une fiche dédiée.
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-[#fbf8f4] p-5 text-sm text-[#5f564c]">
                  Conseil de lancement : publier d’abord 3 à 6 biens vitrines avec des fiches très propres, pour installer immédiatement le bon niveau de perception.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Feature
            title="Lecture fine du terrain"
            description="Arrondissements, flux, linéaires, angles, contraintes techniques et potentiel commercial sont lus avec précision."
          />
          <Feature
            title="Suivi premium"
            description="Chaque dossier est suivi dans une logique claire, réactive et sur-mesure, sans approximation."
          />
          <Feature
            title="Discrétion & efficacité"
            description="Diffusion publique maîtrisée, opportunités confidentielles et traitement sérieux des mandats sensibles."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="surface-card overflow-hidden p-0">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Entrer dans le circuit</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Vous recherchez un local ou vous souhaitez nous confier un actif ?</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f564c]">
                Déposez votre besoin ou votre bien en quelques minutes. Le flux entre ensuite directement dans l’outil de l’agence pour une qualification rapide et structurée.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <Link href="/recherche-local" className="rounded-2xl bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-black/90">
                Déposer une recherche
              </Link>
              <Link href="/proposer-un-bien" className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]">
                Proposer un bien
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-soft">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">{label}</div>
      <div className="mt-2 text-lg font-semibold tracking-tight text-ink">{value}</div>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-card">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Méthode</div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5f564c]">{description}</p>
    </div>
  );
}
