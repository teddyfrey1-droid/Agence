import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntityHeader } from "@/components/ui/entity-header";
import { SectionCard } from "@/components/ui/section-card";
import { DetailItem } from "@/components/ui/detail-item";

function toneForTaskStatus(status: string) {
  switch (status) {
    case "DONE":
      return "success" as const;
    case "IN_PROGRESS":
      return "info" as const;
    case "WAITING":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      assignedUser: { select: { id: true, fullName: true } },
      createdByUser: { select: { id: true, fullName: true } },
      contact: { select: { id: true, fullName: true } },
      property: { select: { id: true, internalTitle: true } },
      searchRequest: { select: { id: true, title: true } },
      deal: { select: { id: true, title: true } },
      fieldSpotting: { select: { id: true, addressText: true } },
    },
  });

  if (!task) return notFound();

  return (
    <div className="space-y-6">
      <EntityHeader
        backHref="/app/taches"
        backLabel="Tâches"
        title={task.title}
        subtitle={`${task.taskType} · ${task.priority}`}
        badges={[
          { label: `Statut · ${task.status}`, tone: toneForTaskStatus(task.status) },
          {
            label: `Échéance · ${task.dueAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(task.dueAt) : "Non définie"}`,
            tone: task.dueAt ? "warning" : "default",
          },
        ]}
        actions={
          <Link
            href={`/app/taches/${task.id}/edit`}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
          >
            Modifier la tâche
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Description" description="Contexte et instruction liée à la tâche.">
            <p className="text-sm leading-6 text-[#3f3a34]">{task.description || "Aucune description."}</p>
          </SectionCard>

          <SectionCard title="Objet lié" description="Éléments CRM rattachés à cette action.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="Contact"
                value={
                  task.contact ? (
                    <Link href={`/app/contacts/${task.contact.id}`} className="hover:underline">
                      {task.contact.fullName}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailItem label="Bien" value={task.property?.internalTitle ?? "—"} />
              <DetailItem label="Demande" value={task.searchRequest?.title ?? "—"} />
              <DetailItem label="Dossier" value={task.deal?.title ?? "—"} />
              <DetailItem label="Repérage" value={task.fieldSpotting?.addressText ?? "—"} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Attribution" description="Traçabilité et responsabilité de la tâche.">
            <div className="space-y-3 text-sm text-[#3f3a34]">
              <Row label="Créée par" value={task.createdByUser.fullName} />
              <Row label="Assignée à" value={task.assignedUser?.fullName ?? "Non assignée"} />
              <Row label="Créée le" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(task.createdAt)} />
              <Row label="Mise à jour" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(task.updatedAt)} />
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
