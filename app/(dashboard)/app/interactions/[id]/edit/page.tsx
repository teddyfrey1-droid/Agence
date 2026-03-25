import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InteractionEditClientPage from "./interaction-edit-client-page";

export default async function InteractionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [interaction, contacts, properties, searchRequests, deals] = await Promise.all([
    prisma.interaction.findFirst({ where: { id, agencyId: user.agencyId } }),
    prisma.contact.findMany({ where: { agencyId: user.agencyId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 200 }),
    prisma.property.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, internalTitle: true }, take: 200 }),
    prisma.searchRequest.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true }, take: 200 }),
    prisma.deal.findMany({ where: { agencyId: user.agencyId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true }, take: 200 }),
  ]);

  if (!interaction) return notFound();

  return (
    <InteractionEditClientPage
      interactionId={interaction.id}
      contacts={contacts.map((item) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item) => ({ id: item.id, label: item.title }))}
      deals={deals.map((item) => ({ id: item.id, label: item.title }))}
      initialValues={{
        summary: interaction.summary,
        details: interaction.details ?? "",
        interactionType: interaction.interactionType,
        happenedAt: interaction.happenedAt.toISOString().slice(0, 16),
        sentiment: interaction.sentiment ?? "",
        nextStep: interaction.nextStep ?? "",
        contactId: interaction.contactId ?? null,
        propertyId: interaction.propertyId ?? null,
        searchRequestId: interaction.searchRequestId ?? null,
        dealId: interaction.dealId ?? null,
      }}
    />
  );
}
