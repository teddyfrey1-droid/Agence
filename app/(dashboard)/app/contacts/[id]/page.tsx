import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DetailItem } from "@/components/ui/detail-item";
import { DocumentUpload } from "@/components/media/document-upload";
import { DocumentList } from "@/components/media/document-list";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";

function toneForRelationshipStage(stage: string) {
  switch (stage) {
    case "ACTIVE":
    case "WARM":
      return "success" as const;
    case "COLD":
      return "warning" as const;
    case "ARCHIVED":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default async function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      ownerUser: { select: { id: true, fullName: true } },
      searchRequests: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, requestType: true },
      },
      deals: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, stage: true, status: true },
      },
      tasks: {
        orderBy: { dueAt: "asc" },
        take: 10,
        select: { id: true, title: true, status: true, dueAt: true },
      },
      interactions: {
        orderBy: { happenedAt: "desc" },
        take: 10,
        select: { id: true, summary: true, interactionType: true, happenedAt: true },
      },
      organizationLinks: {
        include: {
          organization: {
            select: { id: true, legalName: true, displayName: true },
          },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!contact) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/contacts"
        backLabel="Contacts"
        title={contact.fullName}
        subtitle={`${contact.contactTypePrimary} · ${contact.activitySector ?? "Secteur non renseigné"}`}
        badges={[
          { label: `Relation · ${contact.relationshipStage}`, tone: toneForRelationshipStage(contact.relationshipStage) },
          { label: `Priorité · ${contact.priorityLevel}` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/taches/new?contactId=${contact.id}${contact.ownerUser ? `&assignedUserId=${contact.ownerUser.id}` : ""}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle tâche
            </Link>
            <Link
              href={`/app/interactions/new?contactId=${contact.id}`}
              className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm"
            >
              Nouvelle interaction
            </Link>
            <Link
              href={`/app/contacts/${contact.id}/edit`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Modifier
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Fiche de synthèse"
            description="Informations principales pour contextualiser rapidement la relation."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Email" value={contact.email ?? "Non renseigné"} />
              <DetailItem label="Téléphone" value={contact.phone ?? "Non renseigné"} />
              <DetailItem label="WhatsApp" value={contact.whatsappPhone ?? "Non renseigné"} />
              <DetailItem label="Canal préféré" value={contact.preferredContactMethod ?? "Non défini"} />
              <DetailItem label="Source" value={contact.source ?? "Non renseignée"} />
              <DetailItem label="Responsable" value={contact.ownerUser?.fullName ?? "Non assigné"} />
            </div>
          </SectionCard>

          <SectionCard
            title="Demandes actives"
            description="Recherches rattachées à ce contact."
            action={
              <Link href="/app/demandes/new" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                Créer une demande
              </Link>
            }
          >
            <div className="space-y-3">
              {contact.searchRequests.length === 0 ? (
                <p className="text-sm text-[#8a7e71]">Aucune demande liée pour le moment.</p>
              ) : (
                contact.searchRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <Link href={`/app/demandes/${request.id}`} className="font-medium text-ink transition hover:underline">
                      {request.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <StatusPill tone="info">{request.requestType}</StatusPill>
                      <StatusPill>{request.status}</StatusPill>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Dossiers"
            description="Affaires et opportunités commerciales liées."
            action={
              <Link href="/app/dossiers/new" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                Créer un dossier
              </Link>
            }
          >
            <div className="space-y-3">
              {contact.deals.length === 0 ? (
                <p className="text-sm text-[#8a7e71]">Aucun dossier lié pour le moment.</p>
              ) : (
                contact.deals.map((deal) => (
                  <div key={deal.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <Link href={`/app/dossiers/${deal.id}`} className="font-medium text-ink transition hover:underline">
                      {deal.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <StatusPill tone="warning">{deal.stage}</StatusPill>
                      <StatusPill>{deal.status}</StatusPill>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Mémo" description="Notes et informations utiles pour la relation.">
            <p className="text-sm leading-6 text-[#6b665f]">
              {contact.notesSummary ?? "Aucune note de synthèse pour le moment."}
            </p>
          </SectionCard>

          <SectionCard title="Sociétés liées">
            <div className="space-y-3">
              {contact.organizationLinks.length === 0 ? (
                <p className="text-sm text-[#8a7e71]">Aucune société liée.</p>
              ) : (
                contact.organizationLinks.map((link) => (
                  <div key={link.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4 text-sm">
                    <div className="font-medium">
                      {link.organization.displayName || link.organization.legalName}
                    </div>
                    <div className="mt-1 text-[#8a7e71]">{link.roleLabel ?? "Rôle non précisé"}</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Documents" description="Pièces et documents rattachés à ce contact.">
            <div className="space-y-5">
              <DocumentList documents={contact.documents} emptyLabel="Aucun document lié à ce contact." />
              <DocumentUpload contactId={contact.id} title="Ajouter un document au contact" />
            </div>
          </SectionCard>

          <SectionCard title="Tâches liées">
            <div className="space-y-3">
              {contact.tasks.length === 0 ? (
                <p className="text-sm text-[#8a7e71]">Aucune tâche liée.</p>
              ) : (
                contact.tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <Link href={`/app/taches/${task.id}`} className="font-medium text-ink transition hover:underline">
                      {task.title}
                    </Link>
                    <div className="mt-1 text-xs text-[#8a7e71]">
                      {task.dueAt
                        ? new Intl.DateTimeFormat("fr-FR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(task.dueAt)
                        : "Sans échéance"}{" "}
                      · {task.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Dernières interactions"
            action={
              <Link href={`/app/interactions/new?contactId=${contact.id}`} className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                Ajouter une interaction
              </Link>
            }
          >
            <div className="space-y-3">
              {contact.interactions.length === 0 ? (
                <p className="text-sm text-[#8a7e71]">Aucune interaction enregistrée.</p>
              ) : (
                contact.interactions.map((interaction) => (
                  <div key={interaction.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div className="font-medium text-ink">{interaction.summary}</div>
                    <div className="mt-1 text-xs text-[#8a7e71]">
                      {interaction.interactionType} ·{" "}
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(interaction.happenedAt)}
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
