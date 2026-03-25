import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DossierNewClientPage from "./dossier-new-client-page";

export default async function NewDealPage() {
  const user = await requireUser();

  const [contacts, properties, searchRequests] = await Promise.all([
    prisma.contact.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
      take: 200,
    }),
    prisma.property.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, internalTitle: true },
      take: 200,
    }),
    prisma.searchRequest.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
      take: 200,
    }),
  ]);

  return (
    <DossierNewClientPage
      contacts={contacts.map((item: (typeof contacts)[number]) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item: (typeof properties)[number]) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item: (typeof searchRequests)[number]) => ({ id: item.id, label: item.title }))}
    />
  );
}
