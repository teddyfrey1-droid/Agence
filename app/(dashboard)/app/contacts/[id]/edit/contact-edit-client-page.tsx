"use client";

import { useRouter } from "next/navigation";
import { ContactForm, type ContactFormValues } from "@/components/contacts/contact-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function ContactEditClientPage({
  contactId,
  users,
  initialValues,
}: {
  contactId: string;
  users: Option[];
  initialValues: Partial<ContactFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition contact"
        title="Modifier le contact"
        description="Mettez à jour les informations relationnelles, les coordonnées et les éléments de pilotage."
      />

      <ContactForm
        users={users}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/contacts/${contactId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier le contact");

          router.push(`/app/contacts/${contactId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
