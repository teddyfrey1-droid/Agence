import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { AgencyMap } from "@/components/map/agency-map";

export default async function CartePage() {
  const user = await requireUser();

  const [geoProperties, geoSpottings, latestProperties, latestSpottings] = await Promise.all([
    prisma.property.count({
      where: { agencyId: user.agencyId, latitude: { not: null }, longitude: { not: null } },
    }),
    prisma.fieldSpotting.count({
      where: { agencyId: user.agencyId, latitude: { not: null }, longitude: { not: null } },
    }),
    prisma.property.findMany({
      where: { agencyId: user.agencyId, latitude: { not: null }, longitude: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 150,
      select: {
        id: true,
        internalTitle: true,
        arrondissement: true,
        neighborhood: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    }),
    prisma.fieldSpotting.findMany({
      where: { agencyId: user.agencyId, latitude: { not: null }, longitude: { not: null } },
      orderBy: { spottedAt: "desc" },
      take: 150,
      select: {
        id: true,
        addressText: true,
        arrondissement: true,
        spottingStatus: true,
        latitude: true,
        longitude: true,
      },
    }),
  ]);

  const mapMarkers = [
    ...latestProperties
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .map((item) => ({
        id: item.id,
        title: item.internalTitle,
        subtitle: [item.arrondissement, item.neighborhood].filter(Boolean).join(" · ") || item.status,
        href: `/app/biens/${item.id}`,
        kind: "property" as const,
        latitude: item.latitude as number,
        longitude: item.longitude as number,
      })),
    ...latestSpottings
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .map((item) => ({
        id: item.id,
        title: item.addressText ?? "Repérage terrain",
        subtitle: [item.arrondissement, item.spottingStatus].filter(Boolean).join(" · "),
        href: `/app/terrain/${item.id}`,
        kind: "spotting" as const,
        latitude: item.latitude as number,
        longitude: item.longitude as number,
      })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Géographie"
        title="Carte"
        description="Visualise les biens et repérages géolocalisés sur une vraie carte interactive Mapbox, avec recentrage automatique et ouverture directe des fiches."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/biens"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20"
            >
              Voir les biens
            </Link>
            <Link
              href="/app/terrain"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20"
            >
              Voir le terrain
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Biens géolocalisés" value={String(geoProperties)} hint="Affichés sur la carte" />
        <StatCard label="Repérages géolocalisés" value={String(geoSpottings)} hint="Affichés sur la carte" />
        <StatCard label="Marqueurs affichables" value={String(mapMarkers.length)} hint="Biens + repérages exploitables" />
        <StatCard
          label="État carte"
          value={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "Active" : "À configurer"}
          hint={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "Mapbox branché" : "Token requis"}
        />
      </div>

      <AgencyMap token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} markers={mapMarkers} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Biens géolocalisés récents" description="Derniers biens exploitables depuis la carte.">
          <div className="space-y-3">
            {latestProperties.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucun bien géolocalisé pour le moment.</p>
            ) : (
              latestProperties.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 text-sm">
                  <Link href={`/app/biens/${item.id}`} className="font-medium hover:underline">
                    {item.internalTitle}
                  </Link>
                  <div className="mt-1 text-[#6b665f]">
                    {[item.arrondissement, item.neighborhood, item.status].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Repérages terrain récents" description="Repérages prêts à être revus depuis la carte.">
          <div className="space-y-3">
            {latestSpottings.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucun repérage géolocalisé pour le moment.</p>
            ) : (
              latestSpottings.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 text-sm">
                  <Link href={`/app/terrain/${item.id}`} className="font-medium hover:underline">
                    {item.addressText ?? "Adresse non renseignée"}
                  </Link>
                  <div className="mt-1 text-[#6b665f]">
                    {[item.arrondissement, item.spottingStatus].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
