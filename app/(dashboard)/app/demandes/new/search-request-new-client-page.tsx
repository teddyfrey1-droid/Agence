"use client";

import { useRouter } from "next/navigation";
import { SearchRequestForm } from "@/components/search-requests/search-request-form";
import { PageHeader } from "@/components/ui/page-header";

type Props = {
  contacts: Array<{ id: string; fullName: string }>;
};

export default function SearchRequestNewClientPage({ contacts }: Props) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouvelle demande"
        title="Créer une demande"
        description="Structurez le besoin dès maintenant pour le rendre immédiatement exploitable dans le matching, les relances et le suivi de dossier."
      />

      <SearchRequestForm
        contacts={contacts}
        submitLabel="Créer la demande"
        onSubmit={async (values) => {
          const response = await fetch("/api/search-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error("Impossible de créer la demande");
          }

          const json = await response.json();
          router.push(`/app/demandes/${json.data.id}`);
        }}
      />
    </div>
  );
}
