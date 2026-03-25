import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { DetailItem } from "@/components/ui/detail-item";
import { DocumentUpload } from "@/components/media/document-upload";
import { DocumentList } from "@/components/media/document-list";

function toneForRequestStatus(status: string) {
  switch (status) {
    case "ACTIVE":
    case "MATCHED":
    case "IN_PROGRESS":
      return "success" as const;
    case "TO_QUALIFY":
    case "WAITING":
      return "warning" as const;
    case "LOST":
    case "INACTIVE":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default async function SearchRequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const request = await prisma.searchRequest.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      contact: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      assignedUser: {
        select: { id: true, fullName: true },
      },
      matches: {
        orderBy: { score: "desc" },
        take: 10,
        include: {
          property: {
            select: {
              id: true,
              internalTitle: true,
              arrondissement: true,
              totalArea: true,
              monthlyRent: true,
              extractionAvailable: true,
              status: true,
            },
          },
        },
      },
      tasks: {
        orderBy: { dueAt: "asc" },
        take: 10,
      },
      interactions: {
        orderBy: { happenedAt: "desc" },
        take: 10,
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!request) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/demandes"
        backLabel="Demandes"
        title={request.title}
        subtitle={`${request.contact.fullName} · ${request.requestType}`}
        badges={[
          { label: `Statut · ${request.status}`, tone: toneForRequestStatus(request.status) },
          { label: `Priorité · ${request.priority}`, tone: "warning" },
          { label: `Qualification · ${request.qualificationScore ?? 0}%`, tone: "info" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/taches/new?searchRequestId=${request.id}&contactId=${request.contact.id}${request.assignedUser ? `&assignedUserId=${request.assignedUser.id}` : ""}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle tâche
            </Link>
            <Link
              href={`/app/interactions/new?searchRequestId=${request.id}&contactId=${request.contact.id}`}
              className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm"
            >
              Nouvelle interaction
            </Link>
            <Link
              href={`/app/demandes/${request.id}/edit`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Modifier la demande
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Résumé du besoin" description="Critères commerciaux et contraintes principales.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Arrondissements" value={request.targetArrondissements.length ? request.targetArrondissements.join(", ") : "—"} />
              <DetailItem label="Budget max" value={request.budgetMax ? `${request.budgetMax.toString()} €` : "—"} />
              <DetailItem label="Surface min" value={request.areaMin ? `${request.areaMin.toString()} m²` : "—"} />
              <DetailItem
                label="Extraction"
                value={request.extractionRequired === null ? "Indifférent" : request.extractionRequired ? "Obligatoire" : "Non obligatoire"}
              />
              <DetailItem label="Activités autorisées" value={request.allowedActivities.length ? request.allowedActivities.join(", ") : "—"} />
              <DetailItem label="Source" value={request.source ?? "—"} />
            </div>
          </SectionCard>


          <SectionCard title="Interactions" description="Derniers échanges rattachés à cette recherche.">
            <div className="space-y-3">
              {request.interactions.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune interaction enregistrée.</p>
              ) : (
                request.interactions.map((interaction: (typeof request.interactions)[number]) => (
                  <div key={interaction.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <Link href={`/app/interactions/${interaction.id}`} className="font-medium text-ink hover:underline">
                      {interaction.summary}
                    </Link>
                    <div className="mt-1 text-sm text-[#6b665f]">
                      {interaction.interactionType} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(interaction.happenedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
          <SectionCard title="Documents" description="Pièces et éléments partagés autour de la recherche.">
            <div className="space-y-5">
              <DocumentList documents={request.documents} emptyLabel="Aucun document lié à la demande." />
              <DocumentUpload searchRequestId={request.id} title="Ajouter un document à la demande" />
            </div>
          </SectionCard>

          <SectionCard title="Biens compatibles" description="Sélection triée par niveau de pertinence.">
            <div className="space-y-3">
              {request.matches.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucun bien compatible pour le moment.</p>
              ) : (
                request.matches.map((match: (typeof request.matches)[number]) => (
                  <div key={match.id} className="flex items-center justify-between rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div>
                      <Link href={`/app/biens/${match.property.id}`} className="font-medium text-ink hover:underline">
                        {match.property.internalTitle}
                      </Link>
                      <div className="mt-1 text-sm text-[#6b665f]">
                        {match.property.arrondissement ?? "—"} · {match.property.totalArea?.toString() ?? "—"} m² · {match.property.monthlyRent?.toString() ?? "—"} €
                      </div>
                    </div>
                    <div className="rounded-full bg-ink px-3 py-1 text-sm font-medium text-white">{match.score}%</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Contact" description="Interlocuteur principal de la recherche.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <Row
                label="Nom"
                value={
                  <Link href={`/app/contacts/${request.contact.id}`} className="hover:underline">
                    {request.contact.fullName}
                  </Link>
                }
              />
              <Row label="Email" value={request.contact.email ?? "—"} />
              <Row label="Téléphone" value={request.contact.phone ?? "—"} />
              <Row label="Assigné à" value={request.assignedUser?.fullName ?? "Non assigné"} />
            </div>
          </SectionCard>

          <SectionCard title="Relance et tâches" description="Ce qui doit être traité ensuite.">
            <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4 text-sm text-[#3f3a34]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Prochaine relance</div>
              <div className="mt-2 font-medium text-ink">
                {request.nextFollowUpAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(request.nextFollowUpAt)
                  : "Non définie"}
              </div>
            </div>

            <div className="space-y-3">
              {request.tasks.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune tâche liée.</p>
              ) : (
                request.tasks.map((task: (typeof request.tasks)[number]) => (
                  <div key={task.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div className="font-medium text-ink">{task.title}</div>
                    <div className="mt-1 text-sm text-[#6b665f]">{task.status}</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
      <span className="text-[#8a7e71]">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
