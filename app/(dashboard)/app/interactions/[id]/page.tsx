import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DetailItem } from "@/components/ui/detail-item";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";

export default async function InteractionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const interaction = await prisma.interaction.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      authorUser: { select: { id: true, fullName: true } },
      contact: { select: { id: true, fullName: true, email: true, phone: true } },
      property: { select: { id: true, internalTitle: true } },
      searchRequest: { select: { id: true, title: true } },
      deal: { select: { id: true, title: true } },
    },
  });

  if (!interaction) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/interactions"
        backLabel="Interactions"
        title={interaction.summary}
        subtitle={`${interaction.authorUser.fullName} · ${interaction.interactionType}`}
        badges={[
          { label: `Type · ${interaction.interactionType}`, tone: "info" },
          ...(interaction.sentiment ? [{ label: `Retour · ${interaction.sentiment}`, tone: "warning" as const }] : []),
        ]}
        actions={
          <Link
            href={`/app/interactions/${interaction.id}/edit`}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
          >
            Modifier l’interaction
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Détail" description="Résumé précis et mémoire du contexte commercial.">
            <p className="text-sm leading-7 text-[#3f3a34]">{interaction.details || "Aucun détail complémentaire."}</p>
          </SectionCard>

          <SectionCard title="Objets liés" description="Rattachements CRM de cette interaction.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="Contact"
                value={interaction.contact ? <Link href={`/app/contacts/${interaction.contact.id}`} className="hover:underline">{interaction.contact.fullName}</Link> : "—"}
              />
              <DetailItem
                label="Bien"
                value={interaction.property ? <Link href={`/app/biens/${interaction.property.id}`} className="hover:underline">{interaction.property.internalTitle}</Link> : "—"}
              />
              <DetailItem
                label="Demande"
                value={interaction.searchRequest ? <Link href={`/app/demandes/${interaction.searchRequest.id}`} className="hover:underline">{interaction.searchRequest.title}</Link> : "—"}
              />
              <DetailItem
                label="Dossier"
                value={interaction.deal ? <Link href={`/app/dossiers/${interaction.deal.id}`} className="hover:underline">{interaction.deal.title}</Link> : "—"}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Pilotage" description="Auteur, date et prochaine étape.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <div className="rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
                <div className="text-[#8a7e71]">Auteur</div>
                <div className="mt-1 font-medium text-ink">{interaction.authorUser.fullName}</div>
              </div>
              <div className="rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
                <div className="text-[#8a7e71]">Date</div>
                <div className="mt-1 font-medium text-ink">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(interaction.happenedAt)}</div>
              </div>
              <div className="rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">
                <div className="text-[#8a7e71]">Prochaine étape</div>
                <div className="mt-1 font-medium text-ink">{interaction.nextStep || "Aucune"}</div>
              </div>
            </div>
          </SectionCard>

          {interaction.contact ? (
            <SectionCard title="Coordonnées contact">
              <div className="space-y-3 text-sm text-[#3f3a34]">
                <div className="rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">Email · <span className="font-medium text-ink">{interaction.contact.email ?? "—"}</span></div>
                <div className="rounded-xl border border-line bg-[#fbf8f4] px-4 py-3">Téléphone · <span className="font-medium text-ink">{interaction.contact.phone ?? "—"}</span></div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
