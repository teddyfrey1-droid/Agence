import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DealEditClientPage from "./deal-edit-client-page";

function formatDateTimeLocal(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function DealEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [deal, contacts, properties, searchRequests] = await Promise.all([
    prisma.deal.findFirst({ where: { id, agencyId: user.agencyId } }),
    prisma.contact.findMany({ where: { agencyId: user.agencyId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 200 }),
    prisma.property.findMany({ where: { agencyId: user.agencyId }, orderBy: { internalTitle: "asc" }, select: { id: true, internalTitle: true }, take: 200 }),
    prisma.searchRequest.findMany({ where: { agencyId: user.agencyId }, orderBy: { title: "asc" }, select: { id: true, title: true }, take: 200 }),
  ]);

  if (!deal) return notFound();

  return (
    <DealEditClientPage
      dealId={deal.id}
      contacts={contacts.map((item: (typeof contacts)[number]) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item: (typeof properties)[number]) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item: (typeof searchRequests)[number]) => ({ id: item.id, label: item.title }))}
      initialValues={{
        title: deal.title,
        type: deal.type,
        status: deal.status,
        stage: deal.stage,
        priorityLevel: deal.priorityLevel,
        contactId: deal.contactId ?? "",
        propertyId: deal.propertyId ?? "",
        searchRequestId: deal.searchRequestId ?? "",
        estimatedValue: deal.estimatedValue?.toString() ?? "",
        estimatedFees: deal.estimatedFees?.toString() ?? "",
        probabilityPercent: deal.probabilityPercent?.toString() ?? "",
        expectedCloseDate: formatDateTimeLocal(deal.expectedCloseDate),
        originSource: deal.originSource ?? "",
        lostReason: deal.lostReason ?? "",
      }}
    />
  );
}
