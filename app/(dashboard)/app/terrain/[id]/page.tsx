import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConvertSpottingButton } from "@/components/field-spottings/convert-spotting-button";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { DetailItem } from "@/components/ui/detail-item";
import { DocumentUpload } from "@/components/media/document-upload";
import { DocumentList } from "@/components/media/document-list";

function toneForSpottingStatus(status: string) {
  switch (status) {
    case "CONVERTED":
      return "success" as const;
    case "OWNER_SEARCH":
    case "CONTACTED":
    case "FOLLOW_UP":
      return "warning" as const;
    case "DROPPED":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default async function TerrainDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const spotting = await prisma.fieldSpotting.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      createdByUser: { select: { id: true, fullName: true } },
      assignedUser: { select: { id: true, fullName: true } },
      ownerContact: { select: { id: true, fullName: true, email: true, phone: true } },
      tasks: { orderBy: { dueAt: "asc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!spotting) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/terrain"
        backLabel="Terrain"
        title={spotting.addressText ?? "Repérage terrain"}
        subtitle={`${spotting.arrondissement ?? "Arrondissement non renseigné"} · ${spotting.neighborhood ?? "Quartier non renseigné"}`}
        badges={[
          { label: `Statut · ${spotting.spottingStatus}`, tone: toneForSpottingStatus(spotting.spottingStatus) },
          { label: `Créé le · ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(spotting.spottedAt)}` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/taches/new?fieldSpottingId=${spotting.id}${spotting.assignedUser ? `&assignedUserId=${spotting.assignedUser.id}` : ""}${spotting.ownerContact ? `&contactId=${spotting.ownerContact.id}` : ""}`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Nouvelle tâche
            </Link>
            <Link
              href={`/app/terrain/${spotting.id}/edit`}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
            >
              Modifier le repérage
            </Link>
            {spotting.convertedToPropertyId ? (
              <Link href={`/app/biens/${spotting.convertedToPropertyId}`} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink">
                Voir le bien créé
              </Link>
            ) : (
              <ConvertSpottingButton spottingId={spotting.id} />
            )}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Résumé terrain" description="Constat de terrain et données de premier niveau.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Type potentiel" value={spotting.potentialType ?? "—"} />
              <DetailItem label="Surface estimée" value={spotting.estimatedArea ? `${spotting.estimatedArea.toString()} m²` : "—"} />
              <DetailItem label="Vacant apparent" value={spotting.apparentVacancyStatus === null ? "Inconnu" : spotting.apparentVacancyStatus ? "Oui" : "Non"} />
              <DetailItem label="Vitrine visible" value={spotting.storefrontVisible === null ? "Inconnu" : spotting.storefrontVisible ? "Oui" : "Non"} />
              <DetailItem label="Enseigne présente" value={spotting.signagePresent === null ? "Inconnu" : spotting.signagePresent ? "Oui" : "Non"} />
              <DetailItem label="Linéaire estimé" value={spotting.estimatedLinearFrontage ? `${spotting.estimatedLinearFrontage.toString()} m` : "—"} />
            </div>
          </SectionCard>

          <SectionCard title="Note terrain" description="Observations prises au moment du repérage.">
            <p className="text-sm leading-6 text-[#3f3a34]">{spotting.quickNote || "Aucune note terrain."}</p>
          </SectionCard>

          {spotting.photoCoverUrl ? (
            <SectionCard title="Photo" description="Capture principale du repérage.">
              <div className="overflow-hidden rounded-[1.25rem] border border-line">
                <img src={spotting.photoCoverUrl} alt={spotting.addressText ?? "Repérage terrain"} className="h-[360px] w-full object-cover" />
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Documents" description="Plans, notes ou pièces complémentaires liées au repérage.">
            <div className="space-y-5">
              <DocumentList documents={spotting.documents} emptyLabel="Aucun document lié au repérage." />
              <DocumentUpload fieldSpottingId={spotting.id} title="Ajouter un document au repérage" />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Suivi" description="Attribution et qualification commerciale.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <Row label="Créé par" value={spotting.createdByUser.fullName} />
              <Row label="Assigné à" value={spotting.assignedUser?.fullName ?? "Non assigné"} />
              <Row label="Propriétaire identifié" value={spotting.ownerIdentified ? "Oui" : "Non"} />
              <Row label="Propriétaire contacté" value={spotting.ownerContacted ? "Oui" : "Non"} />
            </div>
          </SectionCard>

          <SectionCard title="Contact propriétaire" description="Interlocuteur rattaché au repérage.">
            {spotting.ownerContact ? (
              <div className="space-y-3 text-sm text-[#3f3a34]">
                <Row label="Nom" value={spotting.ownerContact.fullName} />
                <Row label="Email" value={spotting.ownerContact.email ?? "—"} />
                <Row label="Téléphone" value={spotting.ownerContact.phone ?? "—"} />
              </div>
            ) : (
              <p className="text-sm text-[#6b665f]">Aucun contact propriétaire rattaché.</p>
            )}
          </SectionCard>

          <SectionCard title="Tâches liées" description="Actions ouvertes sur ce repérage.">
            <div className="space-y-3">
              {spotting.tasks.length === 0 ? (
                <p className="text-sm text-[#6b665f]">Aucune tâche liée.</p>
              ) : (
                spotting.tasks.map((task: (typeof spotting.tasks)[number]) => (
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
