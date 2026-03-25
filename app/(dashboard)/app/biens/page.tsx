import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export default async function PropertiesPage() {
  const user = await requireUser();

  const properties = await prisma.property.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { updatedAt: "desc" },
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
      <PageHeader
        eyebrow="Portefeuille"
        title="Biens"
        description="Gérez, filtrez et enrichissez l’ensemble de votre portefeuille depuis une vue unique, claire et exploitable."
        actions={
          <Link href="/app/biens/new" className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm">
            Créer un bien
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-600">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Arr.</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Surface</th>
              <th className="px-4 py-3 font-medium">Loyer</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Assigné</th>
              <th className="px-4 py-3 font-medium">MàJ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {properties.map((property) => (
              <tr key={property.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/biens/${property.id}`} className="font-medium hover:underline">
                    {property.internalTitle}
                  </Link>
                </td>
                <td className="px-4 py-3">{property.arrondissement ?? "—"}</td>
                <td className="px-4 py-3">{property.assetType}</td>
                <td className="px-4 py-3">
                  {property.totalArea ? `${property.totalArea.toString()} m²` : "—"}
                </td>
                <td className="px-4 py-3">
                  {property.monthlyRent ? `${property.monthlyRent.toString()} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill>{property.status}</StatusPill>
                </td>
                <td className="px-4 py-3">{property.assignedUser?.fullName ?? "—"}</td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(property.updatedAt)}
                </td>
              </tr>
            ))}

            {properties.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                  Aucun bien pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
