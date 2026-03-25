"use client";

import { useRouter } from "next/navigation";
import { InteractionForm, type InteractionFormValues } from "@/components/interactions/interaction-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function InteractionEditClientPage({
  interactionId,
  contacts,
  properties,
  searchRequests,
  deals,
  initialValues,
}: {
  interactionId: string;
  contacts: Option[];
  properties: Option[];
  searchRequests: Option[];
  deals: Option[];
  initialValues: Partial<InteractionFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition interaction"
        title="Modifier l’interaction"
        description="Ajustez le contenu, le rattachement CRM et la prochaine étape à suivre."
      />

      <InteractionForm
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        deals={deals}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/interactions/${interactionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              happenedAt: values.happenedAt || undefined,
            }),
          });

          if (!response.ok) throw new Error("Impossible de modifier l’interaction");

          router.push(`/app/interactions/${interactionId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
