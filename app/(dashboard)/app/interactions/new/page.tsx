import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InteractionNewClientPage from "./interaction-new-client-page";

export default async function NewInteractionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [contacts, properties, searchRequests, deals] = await Promise.all([
    prisma.contact.findMany({ where: { agencyId: user.agencyId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 200 }),
    prisma.property.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, internalTitle: true }, take: 200 }),
    prisma.searchRequest.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true }, take: 200 }),
    prisma.deal.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true }, take: 200 }),
  ]);

  const getSingle = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

  return (
    <InteractionNewClientPage
      contacts={contacts.map((item: (typeof contacts)[number]) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item: (typeof properties)[number]) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item: (typeof searchRequests)[number]) => ({ id: item.id, label: item.title }))}
      deals={deals.map((item: (typeof deals)[number]) => ({ id: item.id, label: item.title }))}
      initialValues={{
        contactId: getSingle(params.contactId) ?? null,
        propertyId: getSingle(params.propertyId) ?? null,
        searchRequestId: getSingle(params.searchRequestId) ?? null,
        dealId: getSingle(params.dealId) ?? null,
      }}
    />
  );
}
