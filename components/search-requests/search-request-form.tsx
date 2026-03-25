"use client";

import { useState } from "react";
import {
  PRIORITY_LEVELS,
  REQUEST_TYPES,
  SEARCH_REQUEST_STATUSES,
  type PriorityLevelValue,
  type RequestTypeValue,
  type SearchRequestStatusValue,
} from "@/lib/client-options";
import { Field, FormActions, FormSection } from "@/components/ui/form-primitives";

export type SearchRequestFormValues = {
  contactId: string;
  title: string;
  requestType: RequestTypeValue;
  status: SearchRequestStatusValue;
  priority: PriorityLevelValue;
  urgencyLevel: PriorityLevelValue;
  targetArrondissements: string[];
  budgetMax: string;
  areaMin: string;
  extractionRequired: boolean | null;
  allowedActivities: string[];
  source: string;
};

type Props = {
  contacts: Array<{ id: string; fullName: string }>;
  initialValues?: Partial<SearchRequestFormValues>;
  onSubmit: (values: SearchRequestFormValues) => Promise<void>;
  submitLabel?: string;
};

const defaultValues: SearchRequestFormValues = {
  contactId: "",
  title: "",
  requestType: "LOCATION",
  status: "NEW",
  priority: "MEDIUM",
  urgencyLevel: "MEDIUM",
  targetArrondissements: [],
  budgetMax: "",
  areaMin: "",
  extractionRequired: null,
  allowedActivities: [],
  source: "",
};

const PARIS_ARR = ["1e","2e","3e","4e","5e","6e","7e","8e","9e","10e","11e","12e","13e","14e","15e","16e","17e","18e","19e","20e"];

export function SearchRequestForm({ contacts, initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<SearchRequestFormValues>({ ...defaultValues, ...initialValues });
  const [activityInput, setActivityInput] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof SearchRequestFormValues>(key: K, value: SearchRequestFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrondissement(value: string) {
    const exists = values.targetArrondissements.includes(value);
    update("targetArrondissements", exists ? values.targetArrondissements.filter((item) => item !== value) : [...values.targetArrondissements, value]);
  }

  function addActivity() {
    const trimmed = activityInput.trim();
    if (!trimmed || values.allowedActivities.includes(trimmed)) return;
    update("allowedActivities", [...values.allowedActivities, trimmed]);
    setActivityInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Qualification" description="Structurez le besoin pour permettre un matching pertinent et un bon suivi commercial.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact"><select className="field-base" value={values.contactId} onChange={(e) => update("contactId", e.target.value)} required><option value="">Sélectionner un contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.fullName}</option>)}</select></Field>
          <Field label="Titre"><input className="field-base" value={values.title} onChange={(e) => update("title", e.target.value)} required /></Field>
          <Field label="Type de recherche"><select className="field-base" value={values.requestType} onChange={(e) => update("requestType", e.target.value as RequestTypeValue)}>{REQUEST_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Statut"><select className="field-base" value={values.status} onChange={(e) => update("status", e.target.value as SearchRequestStatusValue)}>{SEARCH_REQUEST_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Priorité"><select className="field-base" value={values.priority} onChange={(e) => update("priority", e.target.value as PriorityLevelValue)}>{PRIORITY_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <Field label="Urgence"><select className="field-base" value={values.urgencyLevel} onChange={(e) => update("urgencyLevel", e.target.value as PriorityLevelValue)}>{PRIORITY_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
        </div>
      </FormSection>

      <FormSection title="Critères de recherche" description="Concentrez-vous sur les éléments réellement décisifs pour la sélection.">
        <div className="space-y-5">
          <div>
            <div className="mb-3 text-sm font-medium text-ink">Arrondissements ciblés</div>
            <div className="flex flex-wrap gap-2">
              {PARIS_ARR.map((arr) => {
                const active = values.targetArrondissements.includes(arr);
                return <button key={arr} type="button" onClick={() => toggleArrondissement(arr)} className={`choice-pill ${active ? "choice-pill-active" : ""}`}>{arr}</button>;
              })}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Budget max"><input className="field-base" value={values.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} /></Field>
            <Field label="Surface min"><input className="field-base" value={values.areaMin} onChange={(e) => update("areaMin", e.target.value)} /></Field>
            <Field label="Extraction"><select className="field-base" value={values.extractionRequired === null ? "unknown" : values.extractionRequired ? "true" : "false"} onChange={(e) => update("extractionRequired", e.target.value === "unknown" ? null : e.target.value === "true") }><option value="unknown">Indifférent / inconnu</option><option value="true">Obligatoire</option><option value="false">Non obligatoire</option></select></Field>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-ink">Activités autorisées</div>
            <div className="flex gap-2">
              <input className="field-base" value={activityInput} onChange={(e) => setActivityInput(e.target.value)} placeholder="Ex. restauration rapide" />
              <button type="button" onClick={addActivity} className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white">Ajouter</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {values.allowedActivities.map((activity) => <span key={activity} className="rounded-full border border-line bg-[#fbf8f4] px-3 py-1 text-sm text-ink">{activity}</span>)}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Source" description="Conservez l'origine de la demande pour le suivi commercial et la performance.">
        <Field label="Canal ou provenance"><input className="field-base" value={values.source} onChange={(e) => update("source", e.target.value)} placeholder="Site, téléphone, réseau, apporteur..." /></Field>
      </FormSection>

      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
