import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";

export default async function DashboardHomePage() {
  const user = await requireUser();

  const [
    requestsCount,
    incompleteProperties,
    overdueTasks,
    spottingsCount,
    matchesCount,
    urgentTasks,
    recentProperties,
    strongMatches,
  ] = await Promise.all([
    prisma.searchRequest.count({
      where: { agencyId: user.agencyId, status: { in: ["NEW", "TO_QUALIFY", "ACTIVE"] } },
    }),
    prisma.property.count({ where: { agencyId: user.agencyId, completenessScore: { lt: 60 } } }),
    prisma.task.count({
      where: { agencyId: user.agencyId, dueAt: { lt: new Date() }, status: { not: "DONE" } },
    }),
    prisma.fieldSpotting.count({
      where: { agencyId: user.agencyId, spottingStatus: { in: ["SPOTTED", "TO_REVIEW", "OWNER_SEARCH"] } },
    }),
    prisma.match.count({ where: { agencyId: user.agencyId, score: { gte: 75 } } }),
    prisma.task.findMany({
      where: {
        agencyId: user.agencyId,
        status: { in: ["TODO", "IN_PROGRESS", "WAITING"] },
      },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
      take: 5,
      include: {
        assignedUser: { select: { fullName: true } },
        deal: { select: { title: true } },
      },
    }),
    prisma.property.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        internalTitle: true,
        arrondissement: true,
        status: true,
        completenessScore: true,
      },
    }),
    prisma.match.findMany({
      where: { agencyId: user.agencyId, score: { gte: 75 } },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        property: { select: { id: true, internalTitle: true, arrondissement: true } },
        searchRequest: { select: { id: true, title: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Nouvelles demandes", value: String(requestsCount), hint: "À qualifier ou rappeler rapidement" },
    { label: "Biens à compléter", value: String(incompleteProperties), hint: "Fiches encore incomplètes" },
    { label: "Relances en retard", value: String(overdueTasks), hint: "Actions à reprendre aujourd’hui" },
    { label: "Repérages terrain", value: String(spottingsCount), hint: "Opportunités encore à traiter" },
    { label: "Matches forts", value: String(matchesCount), hint: "Compatibilités supérieures à 75 %" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cockpit"
        title="Accueil"
        description="Vue synthétique de l’activité, des relances prioritaires et des opportunités qui méritent une action immédiate."
        actions={
          <>
            <Link
              href="/app/terrain/new"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20"
            >
              Nouveau repérage
            </Link>
            <Link
              href="/app/biens/new"
              className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black/90"
            >
              Créer un bien
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item: (typeof stats)[number]) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard
          title="Priorités du jour"
          description="Relances, rappels et actions qui doivent avancer sans attendre."
          action={
            <Link href="/app/taches" className="text-sm font-medium text-[#8a7e71] hover:text-black">
              Voir toutes les tâches
            </Link>
          }
        >
          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucune priorité ouverte pour le moment.</p>
            ) : (
              urgentTasks.map((task: (typeof urgentTasks)[number]) => (
                <div key={task.id} className="rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="mt-1 text-sm text-[#6b665f]">
                        {task.deal?.title ? `${task.deal.title} · ` : ""}
                        {task.assignedUser?.fullName ?? "Non assignée"}
                      </div>
                    </div>
                    <StatusPill tone={task.priority === "URGENT" ? "danger" : task.priority === "HIGH" ? "warning" : "info"}>
                      {task.priority}
                    </StatusPill>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Matches forts"
          description="Biens et demandes très compatibles à exploiter rapidement."
          action={
            <Link
              href="/app/demandes"
              className="text-sm font-medium text-[#8a7e71] hover:text-black"
            >
              Ouvrir les demandes
            </Link>
          }
        >
          <div className="space-y-3">
            {strongMatches.length === 0 ? (
              <p className="text-sm text-[#6b665f]">Aucun match fort disponible pour le moment.</p>
            ) : (
              strongMatches.map((match: (typeof strongMatches)[number]) => (
                <div key={match.id} className="rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{match.property.internalTitle}</div>
                      <div className="mt-1 text-sm text-[#6b665f]">
                        {match.searchRequest.title}
                        {match.property.arrondissement ? ` · ${match.property.arrondissement}` : ""}
                      </div>
                    </div>
                    <div className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {match.score}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Biens récemment mis à jour"
        description="Les dernières fiches qui ont bougé et leur niveau de complétude actuel."
        action={
          <Link href="/app/biens" className="text-sm font-medium text-[#8a7e71] hover:text-black">
            Voir les biens
          </Link>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <table className="min-w-full divide-y divide-black/5 bg-white text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-left text-neutral-600">
                <th className="px-4 py-3 font-medium">Bien</th>
                <th className="px-4 py-3 font-medium">Arr.</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Complétude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {recentProperties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-[#6b665f]">
                    Aucun bien pour le moment.
                  </td>
                </tr>
              ) : (
                recentProperties.map((property: (typeof recentProperties)[number]) => (
                  <tr key={property.id}>
                    <td className="px-4 py-3 font-medium">{property.internalTitle}</td>
                    <td className="px-4 py-3">{property.arrondissement ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill>{property.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3">{property.completenessScore ?? 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
