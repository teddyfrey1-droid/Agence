import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEAL_STAGES } from "@/lib/client-options";

export default async function DealsPage() {
  const user = await requireUser();

  const deals = await prisma.deal.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { updatedAt: "desc" },
    include: {
      contact: { select: { fullName: true } },
      property: { select: { internalTitle: true } },
      assignedUser: { select: { fullName: true } },
    },
    take: 100,
  });

  const grouped = Object.fromEntries(
    DEAL_STAGES.map((stage: (typeof DEAL_STAGES)[number]) => [stage, deals.filter((deal: (typeof deals)[number]) => deal.stage === stage)])
  ) as Record<string, typeof deals>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dossiers</h1>
          <p className="mt-1 text-sm text-neutral-500">Suivez chaque affaire par étape, priorité et potentiel.</p>
        </div>

        <Link href="/app/dossiers/new" className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">
          Créer un dossier
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-6">
        {DEAL_STAGES.map((stage: (typeof DEAL_STAGES)[number]) => (
          <section key={stage} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{stage}</h2>
              <span className="rounded-full border border-black/10 px-2 py-1 text-xs text-neutral-500">
                {grouped[stage].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[stage].length === 0 && (
                <div className="rounded-xl border border-dashed border-black/10 px-3 py-4 text-xs text-neutral-400">
                  Aucun dossier
                </div>
              )}

              {grouped[stage].map((deal: (typeof deals)[number]) => (
                <Link
                  key={deal.id}
                  href={`/app/dossiers/${deal.id}`}
                  className="block rounded-xl border border-black/10 bg-neutral-50 px-3 py-3 transition hover:border-black/20 hover:bg-white"
                >
                  <div className="font-medium leading-5">{deal.title}</div>
                  <div className="mt-2 text-xs text-neutral-500">{deal.contact?.fullName ?? "Sans contact"}</div>
                  <div className="mt-1 text-xs text-neutral-500">{deal.property?.internalTitle ?? "Sans bien"}</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full border border-black/10 px-2 py-1">{deal.priorityLevel}</span>
                    <span className="text-neutral-500">{deal.probabilityPercent ?? 0}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
