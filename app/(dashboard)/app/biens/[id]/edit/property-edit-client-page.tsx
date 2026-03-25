"use client";

import { useRouter } from "next/navigation";
import { PropertyForm, type PropertyFormValues } from "@/components/properties/property-form";
import { PageHeader } from "@/components/ui/page-header";

export default function PropertyEditClientPage({
  propertyId,
  initialValues,
}: {
  propertyId: string;
  initialValues: Partial<PropertyFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition"
        title="Modifier le bien"
        description="Mettez à jour la fiche sans perdre la cohérence du portefeuille ni la qualité de diffusion."
      />

      <PropertyForm
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/properties/${propertyId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier le bien");

          router.push(`/app/biens/${propertyId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
