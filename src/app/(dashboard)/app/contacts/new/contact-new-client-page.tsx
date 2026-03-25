"use client";

import { useRouter } from "next/navigation";
import { ContactForm } from "@/components/contacts/contact-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function ContactNewClientPage({ users }: { users: Option[] }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouveau contact"
        title="Créer un contact"
        description="Ajoutez un prospect, un propriétaire ou un partenaire, puis rattachez-le à vos demandes, dossiers et relances."
      />

      <ContactForm
        users={users}
        submitLabel="Créer le contact"
        onSubmit={async (values) => {
          const response = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de créer le contact");

          const json = await response.json();
          router.push(`/app/contacts/${json.data.id}`);
        }}
      />
    </div>
  );
}
