import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TerrainPage() {
  const user = await requireUser();

  const spottings = await prisma.fieldSpotting.findMany({
    where: {
      agencyId: user.agencyId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      assignedUser: {
        select: {
          fullName: true,
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Terrain</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Centralisez les opportunités repérées et transformez-les en biens.
          </p>
        </div>

        <Link
          href="/app/terrain/new"
          className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
        >
          Ajouter un repérage
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-600">
              <th className="px-4 py-3 font-medium">Adresse</th>
              <th className="px-4 py-3 font-medium">Arr.</th>
              <th className="px-4 py-3 font-medium">Vacant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Propriétaire</th>
              <th className="px-4 py-3 font-medium">Assigné</th>
              <th className="px-4 py-3 font-medium">Conversion</th>
              <th className="px-4 py-3 font-medium">MàJ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {spottings.map((spotting: (typeof spottings)[number]) => (
              <tr key={spotting.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/terrain/${spotting.id}`} className="font-medium hover:underline">
                    {spotting.addressText ?? "Repérage sans adresse"}
                  </Link>
                </td>
                <td className="px-4 py-3">{spotting.arrondissement ?? "—"}</td>
                <td className="px-4 py-3">
                  {spotting.apparentVacancyStatus === null
                    ? "Inconnu"
                    : spotting.apparentVacancyStatus
                      ? "Oui"
                      : "Non"}
                </td>
                <td className="px-4 py-3">{spotting.spottingStatus}</td>
                <td className="px-4 py-3">
                  {spotting.ownerIdentified ? "Identifié" : "À rechercher"}
                </td>
                <td className="px-4 py-3">{spotting.assignedUser?.fullName ?? "—"}</td>
                <td className="px-4 py-3">
                  {spotting.convertedToPropertyId ? "Converti" : "—"}
                </td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(spotting.updatedAt)}
                </td>
              </tr>
            ))}

            {spottings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                  Aucun repérage pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
