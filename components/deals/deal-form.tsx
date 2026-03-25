"use client";

import { useState } from "react";
import {
  DEAL_STAGES,
  DEAL_STATUSES,
  DEAL_TYPES,
  PRIORITY_LEVELS,
  type DealStageValue,
  type DealStatusValue,
  type DealTypeValue,
  type PriorityLevelValue,
} from "@/lib/client-options";
import { Field, FormActions, FormSection } from "@/components/ui/form-primitives";

type Option = { id: string; label: string };
export type DealFormValues = {
  title: string; type: DealTypeValue; status: DealStatusValue; stage: DealStageValue; priorityLevel: PriorityLevelValue; contactId: string; propertyId: string; searchRequestId: string; estimatedValue: string; estimatedFees: string; probabilityPercent: string; expectedCloseDate: string; originSource: string; lostReason: string;
};

type Props = { contacts: Option[]; properties: Option[]; searchRequests: Option[]; initialValues?: Partial<DealFormValues>; onSubmit: (values: Record<string, unknown>) => Promise<void>; submitLabel?: string; };

const defaultValues: DealFormValues = { title: "", type: "LOCATION", status: "OPEN", stage: "NOUVEAU", priorityLevel: "MEDIUM", contactId: "", propertyId: "", searchRequestId: "", estimatedValue: "", estimatedFees: "", probabilityPercent: "", expectedCloseDate: "", originSource: "", lostReason: "" };

export function DealForm({ contacts, properties, searchRequests, initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<DealFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  function update<K extends keyof DealFormValues>(key: K, value: DealFormValues[K]) { setValues((prev) => ({ ...prev, [key]: value })); }
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setLoading(true); try { await onSubmit({ ...values, contactId: values.contactId || null, propertyId: values.propertyId || null, searchRequestId: values.searchRequestId || null, estimatedValue: values.estimatedValue || undefined, estimatedFees: values.estimatedFees || undefined, probabilityPercent: values.probabilityPercent ? Number(values.probabilityPercent) : undefined, expectedCloseDate: values.expectedCloseDate || undefined, originSource: values.originSource || undefined, lostReason: values.lostReason || undefined }); } finally { setLoading(false); } }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Fondamentaux du dossier" description="Cadrez l'affaire dès le départ pour une lecture claire du pipeline.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titre" className="md:col-span-2"><input className="field-base" value={values.title} onChange={(e) => update("title", e.target.value)} required /></Field>
          <Field label="Type"><select className="field-base" value={values.type} onChange={(e) => update("type", e.target.value as DealTypeValue)}>{DEAL_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Étape"><select className="field-base" value={values.stage} onChange={(e) => update("stage", e.target.value as DealStageValue)}>{DEAL_STAGES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Statut"><select className="field-base" value={values.status} onChange={(e) => update("status", e.target.value as DealStatusValue)}>{DEAL_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Priorité"><select className="field-base" value={values.priorityLevel} onChange={(e) => update("priorityLevel", e.target.value as PriorityLevelValue)}>{PRIORITY_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
        </div>
      </FormSection>
      <FormSection title="Liaisons métier" description="Reliez l'affaire aux bons objets pour garder une vue 360°.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Contact"><select className="field-base" value={values.contactId} onChange={(e) => update("contactId", e.target.value)}><option value="">Aucun contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.label}</option>)}</select></Field>
          <Field label="Bien"><select className="field-base" value={values.propertyId} onChange={(e) => update("propertyId", e.target.value)}><option value="">Aucun bien</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.label}</option>)}</select></Field>
          <Field label="Demande liée"><select className="field-base" value={values.searchRequestId} onChange={(e) => update("searchRequestId", e.target.value)}><option value="">Aucune demande</option>{searchRequests.map((searchRequest) => <option key={searchRequest.id} value={searchRequest.id}>{searchRequest.label}</option>)}</select></Field>
        </div>
      </FormSection>
      <FormSection title="Potentiel commercial" description="Ajoutez les indicateurs de valeur et la temporalité de l'affaire.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Valeur estimée"><input className="field-base" value={values.estimatedValue} onChange={(e) => update("estimatedValue", e.target.value)} /></Field>
          <Field label="Honoraires estimés"><input className="field-base" value={values.estimatedFees} onChange={(e) => update("estimatedFees", e.target.value)} /></Field>
          <Field label="Probabilité (%)"><input className="field-base" value={values.probabilityPercent} onChange={(e) => update("probabilityPercent", e.target.value)} /></Field>
          <Field label="Signature estimée"><input type="date" className="field-base" value={values.expectedCloseDate} onChange={(e) => update("expectedCloseDate", e.target.value)} /></Field>
          <Field label="Source" className="md:col-span-2"><input className="field-base" value={values.originSource} onChange={(e) => update("originSource", e.target.value)} placeholder="Site, terrain, réseau, apporteur..." /></Field>
        </div>
      </FormSection>
      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
