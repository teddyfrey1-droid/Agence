"use client";

import { useRouter } from "next/navigation";
import { SearchRequestForm, type SearchRequestFormValues } from "@/components/search-requests/search-request-form";
import { PageHeader } from "@/components/ui/page-header";

type ContactOption = { id: string; fullName: string };

export default function SearchRequestEditClientPage({
  searchRequestId,
  contacts,
  initialValues,
}: {
  searchRequestId: string;
  contacts: ContactOption[];
  initialValues: Partial<SearchRequestFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition"
        title="Modifier la demande"
        description="Ajustez le cahier des charges, la priorité et les critères pour garder une lecture commerciale précise."
      />

      <SearchRequestForm
        contacts={contacts}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/search-requests/${searchRequestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier la demande");

          router.push(`/app/demandes/${searchRequestId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
