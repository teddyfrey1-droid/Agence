import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export default async function SearchRequestsPage() {
  const user = await requireUser();

  const requests = await prisma.searchRequest.findMany({
    where: {
      agencyId: user.agencyId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      contact: {
        select: {
          fullName: true,
        },
      },
      assignedUser: {
        select: {
          fullName: true,
        },
      },
      _count: {
        select: {
          matches: true,
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recherches"
        title="Demandes"
        description="Qualifiez, assignez et suivez les recherches actives pour ne jamais laisser un besoin pertinent sans réponse."
        actions={
          <Link href="/app/demandes/new" className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm">
            Créer une demande
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-600">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Zone</th>
              <th className="px-4 py-3 font-medium">Budget max</th>
              <th className="px-4 py-3 font-medium">Extraction</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Matches</th>
              <th className="px-4 py-3 font-medium">MàJ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {requests.map((request) => (
              <tr key={request.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/demandes/${request.id}`} className="font-medium hover:underline">
                    {request.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{request.contact.fullName}</td>
                <td className="px-4 py-3">
                  {request.targetArrondissements.length ? request.targetArrondissements.join(", ") : "—"}
                </td>
                <td className="px-4 py-3">{request.budgetMax ? `${request.budgetMax.toString()} €` : "—"}</td>
                <td className="px-4 py-3">
                  {request.extractionRequired === null ? "Indifférent" : request.extractionRequired ? "Oui" : "Non"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill>{request.status}</StatusPill>
                </td>
                <td className="px-4 py-3">{request._count.matches}</td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(request.updatedAt)}
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                  Aucune demande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
