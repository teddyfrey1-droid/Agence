import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PublicPropertyDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listing = await prisma.listing.findFirst({
    where: { seoSlug: slug, status: "PUBLISHED", visibilityScope: "PUBLIC" },
    include: { property: true },
  });

  if (!listing) return notFound();

  const property = listing.property;

  const detailItems = [
    {
      label: "Type",
      value: property.assetType,
    },
    {
      label: "Surface",
      value: property.totalArea ? `${property.totalArea.toString()} m²` : "À préciser",
    },
    {
      label: "Valeur",
      value: property.monthlyRent
        ? `${property.monthlyRent.toString()} € / mois`
        : property.salePrice
          ? `${property.salePrice.toString()} €`
          : "Sur demande",
    },
    {
      label: "Extraction",
      value:
        property.extractionAvailable === null
          ? "À confirmer"
          : property.extractionAvailable
            ? "Oui"
            : "Non",
    },
    {
      label: "Localisation",
      value: [property.arrondissement, property.neighborhood].filter(Boolean).join(" · ") || "Paris",
    },
    {
      label: "Statut",
      value: listing.status,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 md:px-8 md:py-20">
      <div className="text-sm text-[#6b665f]">
        <Link href="/biens" className="hover:text-ink hover:underline">
          Biens
        </Link>
        <span className="mx-2 text-[#b4a89a]">/</span>
        <span className="text-ink">{listing.listingTitle}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-soft">
            <div className="aspect-[16/10] bg-[linear-gradient(135deg,#ece3d8_0%,#ffffff_48%,#d4b79a_130%)]" />
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Bien publié</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{listing.listingTitle}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5f564c]">
              {listing.publicDescription || "Fiche publique en cours d’enrichissement. Contactez le cabinet pour recevoir le dossier complet ou une sélection plus précise selon votre cahier des charges."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Synthèse</div>
            <div className="mt-5 grid gap-3">
              {detailItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">{item.label}</div>
                  <div className="mt-1 text-sm font-medium text-ink">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Prochaine étape</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Obtenir plus d’informations</h2>
            <p className="mt-3 text-sm leading-7 text-[#5f564c]">
              Pour recevoir le détail complet du bien, les conditions de commercialisation ou une sélection plus ciblée, laissez-nous votre besoin.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/recherche-local" className="rounded-2xl bg-black px-5 py-3 text-center text-sm font-medium text-white">
                Déposer une recherche
              </Link>
              <Link href="/contact" className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-center text-sm font-medium text-ink">
                Contacter le cabinet
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
