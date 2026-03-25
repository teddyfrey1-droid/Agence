import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export default async function InteractionsPage() {
  const user = await requireUser();

  const interactions = await prisma.interaction.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { happenedAt: "desc" },
    include: {
      authorUser: { select: { fullName: true } },
      contact: { select: { id: true, fullName: true } },
      property: { select: { id: true, internalTitle: true } },
      searchRequest: { select: { id: true, title: true } },
      deal: { select: { id: true, title: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mémoire commerciale"
        title="Interactions"
        description="Centralisez les appels, notes, messages et retours clés pour garder une mémoire commerciale vivante."
        actions={
          <Link href="/app/interactions/new" className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm">
            Nouvelle interaction
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-[#fbf8f4]">
            <tr className="text-left text-sm text-[#6b665f]">
              <th className="px-4 py-3 font-medium">Résumé</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Liens</th>
              <th className="px-4 py-3 font-medium">Auteur</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {interactions.map((interaction) => (
              <tr key={interaction.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/interactions/${interaction.id}`} className="font-medium text-ink transition hover:underline">
                    {interaction.summary}
                  </Link>
                  <div className="mt-1 text-xs text-[#8a7e71]">{interaction.nextStep ?? "Aucune prochaine étape"}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone="info">{interaction.interactionType}</StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1 text-xs text-[#6b665f]">
                    {interaction.contact ? <div>Contact · {interaction.contact.fullName}</div> : null}
                    {interaction.property ? <div>Bien · {interaction.property.internalTitle}</div> : null}
                    {interaction.searchRequest ? <div>Demande · {interaction.searchRequest.title}</div> : null}
                    {interaction.deal ? <div>Dossier · {interaction.deal.title}</div> : null}
                    {!interaction.contact && !interaction.property && !interaction.searchRequest && !interaction.deal ? <div>Non rattachée</div> : null}
                  </div>
                </td>
                <td className="px-4 py-3">{interaction.authorUser.fullName}</td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(interaction.happenedAt)}
                </td>
              </tr>
            ))}

            {interactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-sm text-[#8a7e71]">
                  Aucune interaction enregistrée pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
