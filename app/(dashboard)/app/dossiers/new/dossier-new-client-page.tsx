"use client";

import { useRouter } from "next/navigation";
import { DealForm } from "@/components/deals/deal-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function DossierNewClientPage({ contacts, properties, searchRequests }: { contacts: Option[]; properties: Option[]; searchRequests: Option[] }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouveau dossier"
        title="Créer un dossier"
        description="Reliez un contact, une demande et éventuellement un bien pour piloter une affaire de façon structurée, avec étapes, tâches et suivi partagé."
      />

      <DealForm
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        submitLabel="Créer le dossier"
        onSubmit={async (values) => {
          const response = await fetch("/api/deals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de créer le dossier");

          const json = await response.json();
          router.push(`/app/dossiers/${json.data.id}`);
        }}
      />
    </div>
  );
}
