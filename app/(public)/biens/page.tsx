import { prisma } from "@/lib/prisma";
import { PublicPropertyCard } from "@/components/public/public-property-card";

export default async function PublicPropertiesPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED", visibilityScope: "PUBLIC" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { property: true },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 md:px-8 md:py-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Biens</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Biens publiés</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f564c]">
            Une sélection de biens commercialisés avec un niveau d’information clair, structuré et directement exploitable.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm text-[#5f564c] shadow-soft">
          {listings.length} bien{listings.length > 1 ? "s" : ""} visible{listings.length > 1 ? "s" : ""}
        </div>
      </div>

      {listings.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {listings.map((listing) => (
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
          ))}
        </div>
      ) : (
        <div className="surface-card">
          <h2 className="text-2xl font-semibold tracking-tight">Le portefeuille public est vide pour le moment.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f564c]">
            Les biens publiés depuis le backoffice apparaîtront ici automatiquement. En attendant, vous pouvez déposer votre recherche pour être rappelé rapidement.
          </p>
        </div>
      )}
    </div>
  );
}
