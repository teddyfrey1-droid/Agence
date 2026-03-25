"use client";

import { useRouter } from "next/navigation";
import { SpottingForm, type SpottingFormValues } from "@/components/field-spottings/spotting-form";
import { PageHeader } from "@/components/ui/page-header";

export default function TerrainEditClientPage({
  spottingId,
  initialValues,
}: {
  spottingId: string;
  initialValues: Partial<SpottingFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition"
        title="Modifier le repérage"
        description="Complétez ou ajustez le repérage terrain pour le rendre exploitable plus vite."
      />

      <SpottingForm
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/field-spottings/${spottingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier le repérage");

          router.push(`/app/terrain/${spottingId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
