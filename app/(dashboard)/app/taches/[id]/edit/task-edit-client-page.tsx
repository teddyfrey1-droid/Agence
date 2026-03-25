"use client";

import { useRouter } from "next/navigation";
import { TaskForm, type TaskFormValues } from "@/components/tasks/task-form";
import { PageHeader } from "@/components/ui/page-header";

type Option = { id: string; label: string };

export default function TaskEditClientPage({
  taskId,
  users,
  contacts,
  properties,
  searchRequests,
  deals,
  fieldSpottings,
  initialValues,
}: {
  taskId: string;
  users: Option[];
  contacts: Option[];
  properties: Option[];
  searchRequests: Option[];
  deals: Option[];
  fieldSpottings: Option[];
  initialValues: Partial<TaskFormValues>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Édition"
        title="Modifier la tâche"
        description="Réajustez la relance, l’échéance et les objets liés sans casser la traçabilité."
      />

      <TaskForm
        users={users}
        contacts={contacts}
        properties={properties}
        searchRequests={searchRequests}
        deals={deals}
        fieldSpottings={fieldSpottings}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) throw new Error("Impossible de modifier la tâche");

          router.push(`/app/taches/${taskId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
