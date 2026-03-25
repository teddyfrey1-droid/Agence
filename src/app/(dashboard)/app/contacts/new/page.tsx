import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ContactNewClientPage from "./contact-new-client-page";

export default async function NewContactPage() {
  const user = await requireUser();

  const users = await prisma.user.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
    take: 200,
  });

  return (
    <ContactNewClientPage
      users={users.map((item) => ({ id: item.id, label: item.fullName }))}
    />
  );
}
