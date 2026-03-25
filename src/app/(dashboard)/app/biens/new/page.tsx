"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewPropertyPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouveau bien"
        title="Créer un bien"
        description="Créez une fiche brouillon en quelques champs seulement. Vous pourrez ensuite enrichir les informations, préparer la diffusion et rattacher les actions commerciales."
      />

      <PropertyForm
        submitLabel="Créer le bien"
        onSubmit={async (values) => {
          const response = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error("Impossible de créer le bien");
          }

          const json = await response.json();
          router.push(`/app/biens/${json.data.id}`);
        }}
      />
    </div>
  );
}
