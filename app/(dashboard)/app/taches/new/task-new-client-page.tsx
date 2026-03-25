"use client";

import { useRouter } from "next/navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

type InitialTaskValues = {
  assignedUserId?: string;
  contactId?: string;
  propertyId?: string;
  searchRequestId?: string;
  dealId?: string;
  fieldSpottingId?: string;
};

export default function TaskNewClientPage({
  users,
  contacts,
  properties,
  searchRequests,
  deals,
  fieldSpottings,
  initialValues,
}: {
  users: Option[];
  contacts: Option[];
  properties: Option[];
  searchRequests: Option[];
  deals: Option[];
  fieldSpottings: Option[];
  initialValues?: InitialTaskValues;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Nouvelle tâche"
        title="Créer une tâche"
        description="Ajoutez une relance, une action à traiter ou un suivi lié à un bien, une demande, un dossier ou un repérage."
      />

      <TaskForm
        users={users}
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        deals={deals}
        fieldSpottings={fieldSpottings}
        initialValues={initialValues}
        submitLabel="Créer la tâche"
        onSubmit={async (values) => {
          const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de créer la tâche");

          const json = await response.json();
          router.push(`/app/taches/${json.data.id}`);
        }}
      />
    </div>
  );
}
