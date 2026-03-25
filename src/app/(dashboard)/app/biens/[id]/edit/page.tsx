import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PropertyEditClientPage from "./property-edit-client-page";

export default async function PropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, agencyId: user.agencyId },
  });

  if (!property) return notFound();

  return (
    <PropertyEditClientPage
      propertyId={property.id}
      initialValues={{
        internalTitle: property.internalTitle,
        propertyReference: property.propertyReference ?? "",
        status: property.status,
        confidentialityLevel: property.confidentialityLevel,
        sourceType: property.sourceType,
        assetType: property.assetType,
        addressLine1: property.addressLine1 ?? "",
        postalCode: property.postalCode ?? "",
        city: property.city ?? "Paris",
        arrondissement: property.arrondissement ?? "",
        neighborhood: property.neighborhood ?? "",
        monthlyRent: property.monthlyRent?.toString() ?? "",
        salePrice: property.salePrice?.toString() ?? "",
        totalArea: property.totalArea?.toString() ?? "",
        extractionAvailable: property.extractionAvailable,
        internalComment: property.internalComment ?? "",
        isPublishable: property.isPublishable,
      }}
    />
  );
}
