"use client";

import { useRouter } from "next/navigation";
import { InteractionForm, type InteractionFormValues } from "@/components/interactions/interaction-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function InteractionNewClientPage({
  contacts,
  properties,
  searchRequests,
  deals,
  initialValues,
}: {
  contacts: Option[];
  properties: Option[];
  searchRequests: Option[];
  deals: Option[];
  initialValues?: Partial<InteractionFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouvelle interaction"
        title="Enregistrer une interaction"
        description="Conservez un appel, une note, un retour de visite ou toute information utile au suivi commercial."
      />

      <InteractionForm
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        deals={deals}
        initialValues={initialValues}
        submitLabel="Créer l’interaction"
        onSubmit={async (values) => {
          const response = await fetch("/api/interactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              happenedAt: values.happenedAt || undefined,
            }),
          });

          if (!response.ok) throw new Error("Impossible de créer l’interaction");

          const json = await response.json();
          router.push(`/app/interactions/${json.data.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
