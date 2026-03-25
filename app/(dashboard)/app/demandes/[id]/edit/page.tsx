import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SearchRequestEditClientPage from "./search-request-edit-client-page";

export default async function SearchRequestEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [request, contacts] = await Promise.all([
    prisma.searchRequest.findFirst({
      where: { id, agencyId: user.agencyId },
    }),
    prisma.contact.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
      take: 200,
    }),
  ]);

  if (!request) return notFound();

  return (
    <SearchRequestEditClientPage
      searchRequestId={request.id}
      contacts={contacts}
      initialValues={{
        contactId: request.contactId,
        title: request.title,
        requestType: request.requestType,
        status: request.status,
        priority: request.priority,
        urgencyLevel: request.urgencyLevel,
        targetArrondissements: request.targetArrondissements,
        budgetMax: request.budgetMax?.toString() ?? "",
        areaMin: request.areaMin?.toString() ?? "",
        extractionRequired: request.extractionRequired,
        allowedActivities: request.allowedActivities,
        source: request.source ?? "",
      }}
    />
  );
}
