import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

function toneForRelationshipStage(stage: string) {
  switch (stage) {
    case "ACTIVE":
    case "WARM":
      return "success" as const;
    case "COLD":
      return "warning" as const;
    case "ARCHIVED":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default async function ContactsPage() {
  const user = await requireUser();

  const contacts = await prisma.contact.findMany({
    where: {
      agencyId: user.agencyId,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      ownerUser: { select: { fullName: true } },
      _count: { select: { searchRequests: true, deals: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Contacts"
        description="Centralisez les prospects, propriétaires, bailleurs et partenaires dans une vue relationnelle claire et exploitable."
        actions={
          <Link
            href="/app/contacts/new"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm"
          >
            Créer un contact
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-[#fbf8f4]">
            <tr className="text-left text-sm text-[#6b665f]">
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Coordonnées</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Demandes / Dossiers</th>
              <th className="px-4 py-3 font-medium">État</th>
              <th className="px-4 py-3 font-medium">MàJ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {contacts.map((contact: (typeof contacts)[number]) => (
              <tr key={contact.id} className="text-sm">
                <td className="px-4 py-3">
                  <Link href={`/app/contacts/${contact.id}`} className="font-medium text-ink transition hover:underline">
                    {contact.fullName}
                  </Link>
                  <div className="mt-1 text-xs text-[#8a7e71]">{contact.activitySector ?? "Secteur non renseigné"}</div>
                </td>
                <td className="px-4 py-3">{contact.contactTypePrimary}</td>
                <td className="px-4 py-3">
                  <div>{contact.email ?? "—"}</div>
                  <div className="mt-1 text-xs text-[#8a7e71]">{contact.phone ?? "Téléphone non renseigné"}</div>
                </td>
                <td className="px-4 py-3">{contact.ownerUser?.fullName ?? "Non assigné"}</td>
                <td className="px-4 py-3">
                  {contact._count.searchRequests} demande(s) · {contact._count.deals} dossier(s)
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={toneForRelationshipStage(contact.relationshipStage)}>
                    {contact.relationshipStage}
                  </StatusPill>
                </td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(contact.updatedAt)}
                </td>
              </tr>
            ))}

            {contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-[#8a7e71]">
                  Aucun contact pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
