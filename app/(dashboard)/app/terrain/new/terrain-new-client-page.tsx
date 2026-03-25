"use client";

import { useRouter } from "next/navigation";
import { SpottingForm } from "@/components/field-spottings/spotting-form";
import { PageHeader } from "@/components/ui/page-header";

export default function TerrainNewClientPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouveau repérage"
        title="Créer un repérage terrain"
        description="Capturez rapidement un local repéré sur le terrain, puis enrichissez la fiche au bureau sans perdre l'information ni le contexte."
      />

      <SpottingForm
        submitLabel="Créer le repérage"
        onSubmit={async (values) => {
          const response = await fetch("/api/field-spottings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error("Impossible de créer le repérage");
          }

          const json = await response.json();
          router.push(`/app/terrain/${json.data.id}`);
        }}
      />
    </div>
  );
}
