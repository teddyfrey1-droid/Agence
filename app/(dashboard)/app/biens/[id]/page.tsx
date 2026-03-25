import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { DetailItem } from "@/components/ui/detail-item";
import { PropertyMediaGallery } from "@/components/media/property-media-gallery";
import { PropertyMediaUpload } from "@/components/media/property-media-upload";
import { DocumentUpload } from "@/components/media/document-upload";
import { DocumentList } from "@/components/media/document-list";

function toneForPropertyStatus(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "success" as const;
    case "READY_TO_PUBLISH":
      return "info" as const;
    case "CONFIDENTIAL":
      return "warning" as const;
    case "ARCHIVED":
      return "default" as const;
    default:
      return "default" as const;
  }
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      assignedUser: { select: { id: true, fullName: true } },
      createdByUser: { select: { id: true, fullName: true } },
      listings: true,
      matches: {
        orderBy: { score: "desc" },
        take: 10,
        include: {
          searchRequest: { select: { id: true, title: true, status: true } },
        },
      },
      tasks: { orderBy: { dueAt: "asc" }, take: 10 },
      interactions: { orderBy: { happenedAt: "desc" }, take: 10 },
      media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 24 },
      documents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!property) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/biens"
        backLabel="Biens"
        title={property.internalTitle}
        subtitle={`${property.addressLine1 ?? "Adresse non renseignée"} · ${property.arrondissement ?? "Arrondissement non renseigné"}`}
        badges={[
          { label: `Statut · ${property.status}`, tone: toneForPropertyStatus(property.status) },
          { label: `Confidentialité · ${property.confidentialityLevel}` },
          { label: `Complétude · ${property.completenessScore ?? 0}%`, tone: "info" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/taches/new?propertyId=${property.id}${property.assignedUser ? `&assignedUserId=${property.assignedUser.id}` : ""}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle tâche
            </Link>
            <Link
              href={`/app/interactions/new?propertyId=${property.id}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle interaction
            </Link>
            <Link
              href={`/app/biens/${property.id}/edit`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Modifier le bien
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Résumé du bien" description="Vue synthétique de la fiche interne.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Type" value={property.assetType} />
              <DetailItem label="Surface" value={property.totalArea ? `${property.totalArea.toString()} m²` : "—"} />
              <DetailItem label="Loyer mensuel" value={property.monthlyRent ? `${property.monthlyRent.toString()} €` : "—"} />
              <DetailItem label="Prix de vente" value={property.salePrice ? `${property.salePrice.toString()} €` : "—"} />
              <DetailItem
                label="Extraction"
                value={property.extractionAvailable === null ? "Inconnue" : property.extractionAvailable ? "Oui" : "Non"}
              />
              <DetailItem label="Publ. autorisée" value={property.isPublishable ? "Oui" : "Non"} />
            </div>
          </SectionCard>

          <SectionCard title="Positionnement commercial" description="Lecture métier du potentiel du bien.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Activités autorisées" value={property.authorizedActivities.length ? property.authorizedActivities.join(", ") : "—"} />
              <DetailItem label="Activités restreintes" value={property.restrictedActivities.length ? property.restrictedActivities.join(", ") : "—"} />
            </div>
            <div className="mt-4 rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Commentaire interne</div>
              <p className="mt-2 text-sm leading-6 text-[#3f3a34]">{property.internalComment || "Aucun commentaire interne."}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Médias"
            description="Photos internes et visuels publiables du bien."
            action={<div className="text-sm text-[#6b665f]">{property.media.length} média{property.media.length > 1 ? "s" : ""}</div>}
          >
            <div className="space-y-5">
              <PropertyMediaGallery media={property.media} />
              <PropertyMediaUpload propertyId={property.id} />
            </div>
          </SectionCard>

          <SectionCard title="Documents" description="Pièces et documents métier liés à ce bien.">
            <div className="space-y-5">
              <DocumentList documents={property.documents} emptyLabel="Aucun document lié au bien." />
              <DocumentUpload propertyId={property.id} title="Ajouter un document au bien" />
            </div>
          </SectionCard>


          <SectionCard title="Interactions" description="Historique des échanges et notes liés au bien.">
            <div className="space-y-3">
              {property.interactions.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune interaction enregistrée.</p>
              ) : (
                property.interactions.map((interaction: (typeof property.interactions)[number]) => (
                  <div key={interaction.id} className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <Link href={`/app/interactions/${interaction.id}`} className="font-medium text-ink transition hover:underline">
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
          <SectionCard title="Matches recommandés" description="Demandes qui correspondent le mieux à ce bien.">
            <div className="space-y-3">
              {property.matches.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucun match disponible pour le moment.</p>
              ) : (
                property.matches.map((match: (typeof property.matches)[number]) => (
                  <div key={match.id} className="flex items-center justify-between rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
                    <div>
                      <div className="font-medium text-ink">{match.searchRequest.title}</div>
                      <div className="mt-1 text-sm text-[#6b665f]">{match.searchRequest.status}</div>
                    </div>
                    <div className="rounded-full bg-ink px-3 py-1 text-sm font-medium text-white">{match.score}%</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Pilotage" description="Propriété, attribution et diffusion.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <Row label="Créé par" value={property.createdByUser.fullName} />
              <Row label="Assigné à" value={property.assignedUser?.fullName ?? "Non assigné"} />
              <Row label="Mis à jour" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(property.updatedAt)} />
              <Row label="Listings liés" value={String(property.listings.length)} />
            </div>
          </SectionCard>

          <SectionCard title="Tâches liées" description="Actions à traiter autour de ce bien.">
            <div className="space-y-3">
              {property.tasks.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune tâche liée.</p>
              ) : (
                property.tasks.map((task: (typeof property.tasks)[number]) => (
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
      <span className="text-[#8a7e71]">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
