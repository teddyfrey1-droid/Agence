import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskNewClientPage from "./task-new-client-page";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [users, contacts, properties, searchRequests, deals, fieldSpottings] = await Promise.all([
    prisma.user.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
      take: 200,
    }),
    prisma.contact.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
      take: 200,
    }),
    prisma.property.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { internalTitle: "asc" },
      select: { id: true, internalTitle: true },
      take: 200,
    }),
    prisma.searchRequest.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
      take: 200,
    }),
    prisma.deal.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
      take: 200,
    }),
    prisma.fieldSpotting.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { spottedAt: "desc" },
      select: { id: true, addressText: true },
      take: 200,
    }),
  ]);

  const getSingle = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return (
    <TaskNewClientPage
      users={users.map((item: (typeof users)[number]) => ({ id: item.id, label: item.fullName }))}
      contacts={contacts.map((item: (typeof contacts)[number]) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item: (typeof properties)[number]) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item: (typeof searchRequests)[number]) => ({ id: item.id, label: item.title }))}
      deals={deals.map((item: (typeof deals)[number]) => ({ id: item.id, label: item.title }))}
      fieldSpottings={fieldSpottings.map((item: (typeof fieldSpottings)[number]) => ({ id: item.id, label: item.addressText || "Repérage sans adresse" }))}
      initialValues={{
        contactId: getSingle(params.contactId) ?? "",
        propertyId: getSingle(params.propertyId) ?? "",
        searchRequestId: getSingle(params.searchRequestId) ?? "",
        dealId: getSingle(params.dealId) ?? "",
        fieldSpottingId: getSingle(params.fieldSpottingId) ?? "",
        assignedUserId: getSingle(params.assignedUserId) ?? "",
      }}
    />
  );
}
