import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TerrainEditClientPage from "./terrain-edit-client-page";

export default async function TerrainEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const spotting = await prisma.fieldSpotting.findFirst({
    where: { id, agencyId: user.agencyId },
  });

  if (!spotting) return notFound();

  return (
    <TerrainEditClientPage
      spottingId={spotting.id}
      initialValues={{
        spottingStatus: spotting.spottingStatus,
        photoCoverUrl: spotting.photoCoverUrl ?? "",
        addressText: spotting.addressText ?? "",
        postalCode: spotting.postalCode ?? "",
        arrondissement: spotting.arrondissement ?? "",
        neighborhood: spotting.neighborhood ?? "",
        quickNote: spotting.quickNote ?? "",
        ownerIdentified: spotting.ownerIdentified,
        ownerContacted: spotting.ownerContacted,
        potentialType: spotting.potentialType ?? "",
        storefrontVisible: spotting.storefrontVisible,
        apparentVacancyStatus: spotting.apparentVacancyStatus,
        signagePresent: spotting.signagePresent,
        estimatedArea: spotting.estimatedArea?.toString() ?? "",
        estimatedLinearFrontage: spotting.estimatedLinearFrontage?.toString() ?? "",
      }}
    />
  );
}
