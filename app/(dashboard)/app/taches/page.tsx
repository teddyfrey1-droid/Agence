import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function relatedLabel(task: {
  contact: { fullName: string } | null;
  property: { internalTitle: string } | null;
  searchRequest: { title: string } | null;
  deal: { title: string } | null;
  fieldSpotting: { addressText: string | null } | null;
}) {
  return (
    task.contact?.fullName ||
    task.property?.internalTitle ||
    task.searchRequest?.title ||
    task.deal?.title ||
    task.fieldSpotting?.addressText ||
    "—"
  );
}

export default async function TasksPage() {
  const user = await requireUser();

  const tasks = await prisma.task.findMany({
    where: {
      agencyId: user.agencyId,
    },
    orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
    include: {
      assignedUser: { select: { fullName: true } },
      contact: { select: { fullName: true } },
      property: { select: { internalTitle: true } },
      searchRequest: { select: { title: true } },
      deal: { select: { title: true } },
      fieldSpotting: { select: { addressText: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tâches</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Suivez les relances, actions à mener et points de blocage.
          </p>
        </div>

        <Link
          href="/app/taches/new"
          className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
        >
          Créer une tâche
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-600">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Priorité</th>
              <th className="px-4 py-3 font-medium">Liée à</th>
              <th className="px-4 py-3 font-medium">Assignée</th>
              <th className="px-4 py-3 font-medium">Échéance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {tasks.map((task: (typeof tasks)[number]) => (
              <tr key={task.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/taches/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{task.taskType}</td>
                <td className="px-4 py-3">{task.status}</td>
                <td className="px-4 py-3">{task.priority}</td>
                <td className="px-4 py-3">{relatedLabel(task)}</td>
                <td className="px-4 py-3">{task.assignedUser?.fullName ?? "—"}</td>
                <td className="px-4 py-3">
                  {task.dueAt
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(task.dueAt)
                    : "—"}
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-500">
                  Aucune tâche pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
