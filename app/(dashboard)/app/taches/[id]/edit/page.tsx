import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskEditClientPage from "./task-edit-client-page";

function formatDateTimeLocal(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function TaskEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [task, users, contacts, properties, searchRequests, deals, fieldSpottings] = await Promise.all([
    prisma.task.findFirst({ where: { id, agencyId: user.agencyId } }),
    prisma.user.findMany({ where: { agencyId: user.agencyId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 200 }),
    prisma.contact.findMany({ where: { agencyId: user.agencyId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 200 }),
    prisma.property.findMany({ where: { agencyId: user.agencyId }, orderBy: { internalTitle: "asc" }, select: { id: true, internalTitle: true }, take: 200 }),
    prisma.searchRequest.findMany({ where: { agencyId: user.agencyId }, orderBy: { title: "asc" }, select: { id: true, title: true }, take: 200 }),
    prisma.deal.findMany({ where: { agencyId: user.agencyId }, orderBy: { title: "asc" }, select: { id: true, title: true }, take: 200 }),
    prisma.fieldSpotting.findMany({ where: { agencyId: user.agencyId }, orderBy: { spottedAt: "desc" }, select: { id: true, addressText: true }, take: 200 }),
  ]);

  if (!task) return notFound();

  return (
    <TaskEditClientPage
      taskId={task.id}
      users={users.map((item: (typeof users)[number]) => ({ id: item.id, label: item.fullName }))}
      contacts={contacts.map((item: (typeof contacts)[number]) => ({ id: item.id, label: item.fullName }))}
      properties={properties.map((item: (typeof properties)[number]) => ({ id: item.id, label: item.internalTitle }))}
      searchRequests={searchRequests.map((item: (typeof searchRequests)[number]) => ({ id: item.id, label: item.title }))}
      deals={deals.map((item: (typeof deals)[number]) => ({ id: item.id, label: item.title }))}
      fieldSpottings={fieldSpottings.map((item: (typeof fieldSpottings)[number]) => ({ id: item.id, label: item.addressText || "Repérage sans adresse" }))}
      initialValues={{
        title: task.title,
        description: task.description ?? "",
        taskType: task.taskType,
        status: task.status,
        priority: task.priority,
        dueAt: formatDateTimeLocal(task.dueAt),
        assignedUserId: task.assignedUserId ?? "",
        contactId: task.contactId ?? "",
        propertyId: task.propertyId ?? "",
        searchRequestId: task.searchRequestId ?? "",
        dealId: task.dealId ?? "",
        fieldSpottingId: task.fieldSpottingId ?? "",
      }}
    />
  );
}
