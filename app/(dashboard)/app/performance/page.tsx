import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill, type StatusPillTone } from "@/components/ui/status-pill";

function toneForStage(stage: string): StatusPillTone {
  if (["SIGNE", "WON"].includes(stage)) return "success";
  if (["PERDU", "LOST"].includes(stage)) return "danger";
  if (["NEGOCIATION", "OFFRE", "SIGNATURE"].includes(stage)) return "warning";
  return "default";
}

export default async function PerformancePage() {
  const user = await requireUser();

  const [
    totalContacts,
    activeRequests,
    publishedListings,
    openDeals,
    overdueTasks,
    openSpottings,
    dealsByStage,
    requestsByStatus,
    latestAudit,
  ] = await Promise.all([
    prisma.contact.count({ where: { agencyId: user.agencyId } }),
    prisma.searchRequest.count({
      where: { agencyId: user.agencyId, status: { in: ["NEW", "TO_QUALIFY", "ACTIVE", "IN_PROGRESS", "MATCHED"] } },
    }),
    prisma.listing.count({ where: { agencyId: user.agencyId, status: "PUBLISHED" } }),
    prisma.deal.count({ where: { agencyId: user.agencyId, status: "OPEN" } }),
    prisma.task.count({
      where: {
        agencyId: user.agencyId,
        status: { in: ["TODO", "IN_PROGRESS", "WAITING"] },
        dueAt: { lt: new Date() },
      },
    }),
    prisma.fieldSpotting.count({
      where: { agencyId: user.agencyId, spottingStatus: { in: ["SPOTTED", "TO_REVIEW", "OWNER_SEARCH", "OWNER_IDENTIFIED", "CONTACTED", "FOLLOW_UP"] } },
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      where: { agencyId: user.agencyId },
      _count: { _all: true },
      orderBy: { stage: "asc" },
    }),
    prisma.searchRequest.groupBy({
      by: ["status"],
      where: { agencyId: user.agencyId },
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { happenedAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pilotage"
        title="Performance"
        description="Vue synthétique de l’activité commerciale, des points de friction et du rythme opérationnel de l’agence."
        actions={
          <Link
            href="/app/accueil"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20"
          >
            Retour accueil
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Contacts totaux" value={String(totalContacts)} hint="Base relationnelle cumulée" />
        <StatCard label="Demandes actives" value={String(activeRequests)} hint="Recherches à suivre" />
        <StatCard label="Biens publiés" value={String(publishedListings)} hint="Diffusion publique en ligne" />
        <StatCard label="Dossiers ouverts" value={String(openDeals)} hint="Affaires en cours" />
        <StatCard label="Relances en retard" value={String(overdueTasks)} hint="À traiter en priorité" />
        <StatCard label="Repérages ouverts" value={String(openSpottings)} hint="Terrain à exploiter" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          title="Pipeline dossiers"
          description="Répartition actuelle des affaires par étape."
        >
          <div className="space-y-3">
            {dealsByStage.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucun dossier pour le moment.</p>
            ) : (
              dealsByStage.map((item) => (
                <div key={item.stage} className="flex items-center justify-between rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <StatusPill tone={toneForStage(item.stage)}>{item.stage}</StatusPill>
                  </div>
                  <div className="text-sm font-medium">{item._count._all}</div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Statut des demandes"
          description="Vue rapide des recherches entrantes et déjà qualifiées."
        >
          <div className="space-y-3">
            {requestsByStatus.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucune demande pour le moment.</p>
            ) : (
              requestsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                  <StatusPill>{item.status}</StatusPill>
                  <div className="text-sm font-medium">{item._count._all}</div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Activité récente"
        description="Dernières actions historisées dans l’application."
      >
        <div className="space-y-3">
          {latestAudit.length === 0 ? (
            <p className="text-sm text-[#6b665f]">Aucune activité récente.</p>
          ) : (
            latestAudit.map((item) => (
              <div key={item.id} className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusPill tone="info">{item.actionType}</StatusPill>
                    <div className="text-sm font-medium">
                      {item.entityType} · {item.entityId.slice(0, 8)}
                    </div>
                  </div>
                  <div className="text-xs text-[#8a7e71]">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(item.happenedAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
