import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ContactEditClientPage from "./contact-edit-client-page";

export default async function ContactEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [contact, users] = await Promise.all([
    prisma.contact.findFirst({
      where: { id, agencyId: user.agencyId },
    }),
    prisma.user.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
      take: 200,
    }),
  ]);

  if (!contact) return notFound();

  return (
    <ContactEditClientPage
      contactId={contact.id}
      users={users.map((item: (typeof users)[number]) => ({ id: item.id, label: item.fullName }))}
      initialValues={{
        fullName: contact.fullName,
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        whatsappPhone: contact.whatsappPhone ?? "",
        preferredContactMethod: contact.preferredContactMethod ?? "",
        source: contact.source ?? "",
        contactTypePrimary: contact.contactTypePrimary,
        activitySector: contact.activitySector ?? "",
        priorityLevel: contact.priorityLevel,
        relationshipStage: contact.relationshipStage,
        notesSummary: contact.notesSummary ?? "",
        ownerUserId: contact.ownerUserId ?? null,
      }}
    />
  );
}
