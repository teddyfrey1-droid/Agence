import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SearchRequestNewClientPage from "./search-request-new-client-page";

export default async function NewSearchRequestPage() {
  const user = await requireUser();

  const contacts = await prisma.contact.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
    take: 200,
  });

  return <SearchRequestNewClientPage contacts={contacts} />;
}
