"use client";

import { useRouter } from "next/navigation";
import { DealForm, type DealFormValues } from "@/components/deals/deal-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function DealEditClientPage({
  dealId,
  contacts,
  properties,
  searchRequests,
  initialValues,
}: {
  dealId: string;
  contacts: Option[];
  properties: Option[];
  searchRequests: Option[];
  initialValues: Partial<DealFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition"
        title="Modifier le dossier"
        description="Ajustez l’étape, les objets liés et les paramètres commerciaux du dossier."
      />

      <DealForm
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/deals/${dealId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier le dossier");

          router.push(`/app/dossiers/${dealId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
