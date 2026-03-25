"use client";

import { useState } from "react";
import {
  PRIORITY_LEVELS,
  TASK_STATUSES,
  TASK_TYPES,
  type PriorityLevelValue,
  type TaskStatusValue,
  type TaskTypeValue,
} from "@/lib/client-options";
import { Field, FormActions, FormSection } from "@/components/ui/form-primitives";

type Option = { id: string; label: string };

export type TaskFormValues = {
  title: string; description: string; taskType: TaskTypeValue; status: TaskStatusValue; priority: PriorityLevelValue; dueAt: string; assignedUserId: string; contactId: string; propertyId: string; searchRequestId: string; dealId: string; fieldSpottingId: string;
};

type Props = { users: Option[]; contacts: Option[]; properties: Option[]; searchRequests: Option[]; deals: Option[]; fieldSpottings: Option[]; initialValues?: Partial<TaskFormValues>; onSubmit: (values: Record<string, unknown>) => Promise<void>; submitLabel?: string; };

const defaultValues: TaskFormValues = { title: "", description: "", taskType: "FOLLOW_UP", status: "TODO", priority: "MEDIUM", dueAt: "", assignedUserId: "", contactId: "", propertyId: "", searchRequestId: "", dealId: "", fieldSpottingId: "" };
function normalizeNullable(value: string) { return value === "" ? null : value; }

export function TaskForm({ users, contacts, properties, searchRequests, deals, fieldSpottings, initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<TaskFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) { setValues((prev) => ({ ...prev, [key]: value })); }
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setLoading(true); try { await onSubmit({ title: values.title, description: values.description, taskType: values.taskType, status: values.status, priority: values.priority, dueAt: values.dueAt || undefined, assignedUserId: normalizeNullable(values.assignedUserId), contactId: normalizeNullable(values.contactId), propertyId: normalizeNullable(values.propertyId), searchRequestId: normalizeNullable(values.searchRequestId), dealId: normalizeNullable(values.dealId), fieldSpottingId: normalizeNullable(values.fieldSpottingId) }); } finally { setLoading(false); } }
  const relationOptions = [{ name: "contactId", label: "Contact", items: contacts }, { name: "propertyId", label: "Bien", items: properties }, { name: "searchRequestId", label: "Demande", items: searchRequests }, { name: "dealId", label: "Dossier", items: deals }, { name: "fieldSpottingId", label: "Repérage", items: fieldSpottings }] as const;
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Tâche" description="Ajoutez une relance claire, assignée et datée pour ne rien laisser se perdre.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titre" className="md:col-span-2"><input className="field-base" value={values.title} onChange={(e) => update("title", e.target.value)} required /></Field>
          <Field label="Type"><select className="field-base" value={values.taskType} onChange={(e) => update("taskType", e.target.value as TaskTypeValue)}>{TASK_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Statut"><select className="field-base" value={values.status} onChange={(e) => update("status", e.target.value as TaskStatusValue)}>{TASK_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Priorité"><select className="field-base" value={values.priority} onChange={(e) => update("priority", e.target.value as PriorityLevelValue)}>{PRIORITY_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Échéance"><input type="datetime-local" className="field-base" value={values.dueAt} onChange={(e) => update("dueAt", e.target.value)} /></Field>
          <Field label="Description" className="md:col-span-2"><textarea className="field-base min-h-28" value={values.description} onChange={(e) => update("description", e.target.value)} /></Field>
        </div>
      </FormSection>
      <FormSection title="Attribution et contexte" description="Reliez la tâche au bon utilisateur et au bon objet métier.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Assignée à"><select className="field-base" value={values.assignedUserId} onChange={(e) => update("assignedUserId", e.target.value)}><option value="">Non assignée</option>{users.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
          {relationOptions.map((relation) => <Field key={relation.name} label={relation.label}><select className="field-base" value={values[relation.name]} onChange={(e) => update(relation.name, e.target.value)}><option value="">Aucun</option>{relation.items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>)}
        </div>
      </FormSection>
      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
