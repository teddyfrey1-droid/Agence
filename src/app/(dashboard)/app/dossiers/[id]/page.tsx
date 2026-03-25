import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { DetailItem } from "@/components/ui/detail-item";
import { DocumentUpload } from "@/components/media/document-upload";
import { DocumentList } from "@/components/media/document-list";

function toneForDealStage(stage: string) {
  switch (stage) {
    case "SIGNE":
      return "success" as const;
    case "NEGOCIATION":
    case "OFFRE":
    case "SIGNATURE":
      return "warning" as const;
    case "PERDU":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      contact: { select: { id: true, fullName: true, email: true, phone: true } },
      property: { select: { id: true, internalTitle: true, arrondissement: true, totalArea: true, monthlyRent: true } },
      searchRequest: { select: { id: true, title: true, status: true } },
      assignedUser: { select: { id: true, fullName: true } },
      createdByUser: { select: { id: true, fullName: true } },
      tasks: { orderBy: { dueAt: "asc" }, take: 10 },
      interactions: { orderBy: { happenedAt: "desc" }, take: 10 },
      visits: { orderBy: { scheduledAt: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!deal) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/dossiers"
        backLabel="Dossiers"
        title={deal.title}
        subtitle={`${deal.contact?.fullName ?? "Sans contact"} · ${deal.type}`}
        badges={[
          { label: `Étape · ${deal.stage}`, tone: toneForDealStage(deal.stage) },
          { label: `Statut · ${deal.status}` },
          { label: `Probabilité · ${deal.probabilityPercent ?? 0}%`, tone: "info" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/taches/new?dealId=${deal.id}${deal.contact ? `&contactId=${deal.contact.id}` : ""}${deal.assignedUser ? `&assignedUserId=${deal.assignedUser.id}` : ""}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle tâche
            </Link>
            <Link
              href={`/app/interactions/new?dealId=${deal.id}${deal.contact ? `&contactId=${deal.contact.id}` : ""}`}
              className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm"
            >
              Nouvelle interaction
            </Link>
            <Link
              href={`/app/dossiers/${deal.id}/edit`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Modifier le dossier
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Synthèse du dossier" description="Vue d’ensemble commerciale de l’affaire.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Priorité" value={deal.priorityLevel} />
              <DetailItem label="Valeur estimée" value={deal.estimatedValue ? `${deal.estimatedValue.toString()} €` : "—"} />
              <DetailItem label="Honoraires estimés" value={deal.estimatedFees ? `${deal.estimatedFees.toString()} €` : "—"} />
              <DetailItem
                label="Signature estimée"
                value={deal.expectedCloseDate ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(deal.expectedCloseDate) : "—"}
              />
              <DetailItem label="Source" value={deal.originSource ?? "—"} />
              <DetailItem label="Créé par" value={deal.createdByUser.fullName} />
            </div>
          </SectionCard>

          <SectionCard title="Objets liés" description="Ce que ce dossier relie dans le CRM.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <LinkedRow label="Contact" href={deal.contact ? `/app/contacts/${deal.contact.id}` : undefined} value={deal.contact ? <Link href={`/app/contacts/${deal.contact.id}`} className="hover:underline">{deal.contact.fullName}</Link> : "—"} />
              <LinkedRow label="Bien" href={deal.property ? `/app/biens/${deal.property.id}` : undefined} value={deal.property?.internalTitle ?? "—"} />
              <LinkedRow label="Demande" href={deal.searchRequest ? `/app/demandes/${deal.searchRequest.id}` : undefined} value={deal.searchRequest?.title ?? "—"} />
              <LinkedRow label="Responsable" value={deal.assignedUser?.fullName ?? "Non assigné"} />
            </div>
          </SectionCard>

          <SectionCard
            title="Interactions récentes"
            description="Derniers échanges et retours liés à l’affaire."
            action={
              <Link href={`/app/interactions/new?dealId=${deal.id}${deal.contact ? `&contactId=${deal.contact.id}` : ""}`} className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                Ajouter une interaction
              </Link>
            }
          >
            <div className="space-y-3">
              {deal.interactions.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune interaction enregistrée.</p>
              ) : (
                deal.interactions.map((interaction) => (
                  <div key={interaction.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div className="font-medium text-ink">{interaction.summary}</div>
                    <div className="mt-1 text-sm text-[#6b665f]">
                      {interaction.interactionType} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(interaction.happenedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>


          <SectionCard title="Documents" description="Pièces liées à la négociation, au mandat ou à la transaction.">
            <div className="space-y-5">
              <DocumentList documents={deal.documents} emptyLabel="Aucun document lié au dossier." />
              <DocumentUpload dealId={deal.id} title="Ajouter un document au dossier" />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Tâches liées" description="Actions ouvertes sur ce dossier.">
            <div className="space-y-3">
              {deal.tasks.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune tâche liée.</p>
              ) : (
                deal.tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div className="font-medium text-ink">{task.title}</div>
                    <div className="mt-1 text-sm text-[#6b665f]">{task.status}</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Visites" description="Historique des rendez-vous liés à l’affaire.">
            <div className="space-y-3">
              {deal.visits.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune visite liée.</p>
              ) : (
                deal.visits.map((visit) => (
                  <div key={visit.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div className="font-medium text-ink">{visit.status}</div>
                    <div className="mt-1 text-sm text-[#6b665f]">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(visit.scheduledAt)}
                    </div>
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

function LinkedRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
      <span className="text-[#8a7e71]">{label}</span>
      {href ? (
        <Link href={href} className="text-right font-medium text-ink hover:underline">
          {value}
        </Link>
      ) : (
        <span className="text-right font-medium text-ink">{value}</span>
      )}
    </div>
  );
}
