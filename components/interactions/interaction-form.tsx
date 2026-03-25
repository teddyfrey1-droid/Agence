"use client";

import { useMemo, useState } from "react";
import { INTERACTION_TYPES, type InteractionTypeValue } from "@/lib/client-options";
import { Field, FormActions, FormSection } from "@/components/ui/form-primitives";

type Option = { id: string; label: string };

export type InteractionFormValues = {
  summary: string;
  details: string;
  interactionType: InteractionTypeValue;
  happenedAt: string;
  sentiment: string;
  nextStep: string;
  contactId: string | null;
  propertyId: string | null;
  searchRequestId: string | null;
  dealId: string | null;
};

type Props = {
  contacts?: Option[];
  properties?: Option[];
  searchRequests?: Option[];
  deals?: Option[];
  initialValues?: Partial<InteractionFormValues>;
  onSubmit: (values: InteractionFormValues) => Promise<void>;
  submitLabel?: string;
};

const defaultValues: InteractionFormValues = {
  summary: "",
  details: "",
  interactionType: "INTERNAL_NOTE",
  happenedAt: "",
  sentiment: "",
  nextStep: "",
  contactId: null,
  propertyId: null,
  searchRequestId: null,
  dealId: null,
};

export function InteractionForm({
  contacts = [],
  properties = [],
  searchRequests = [],
  deals = [],
  initialValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: Props) {
  const [values, setValues] = useState<InteractionFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [loading, setLoading] = useState(false);

  const interactionTypeOptions = useMemo(() => INTERACTION_TYPES, []);

  function update<K extends keyof InteractionFormValues>(key: K, value: InteractionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      <FormSection
        title="Interaction"
        description="Conservez le résumé exact de l’échange et la prochaine étape attendue."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Résumé" className="md:col-span-2">
            <input
              className="field-base"
              value={values.summary}
              onChange={(e) => update("summary", e.target.value)}
              required
            />
          </Field>

          <Field label="Type d’interaction">
            <select
              className="field-base"
              value={values.interactionType}
              onChange={(e) => update("interactionType", e.target.value as InteractionTypeValue)}
            >
              {interactionTypeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date et heure">
            <input
              type="datetime-local"
              className="field-base"
              value={values.happenedAt}
              onChange={(e) => update("happenedAt", e.target.value)}
            />
          </Field>

          <Field label="Sentiment / retour">
            <input
              className="field-base"
              value={values.sentiment}
              onChange={(e) => update("sentiment", e.target.value)}
              placeholder="Ex. intéressé, hésitant, à relancer"
            />
          </Field>

          <Field label="Prochaine étape">
            <input
              className="field-base"
              value={values.nextStep}
              onChange={(e) => update("nextStep", e.target.value)}
              placeholder="Ex. rappeler vendredi, envoyer sélection"
            />
          </Field>

          <Field label="Détails" className="md:col-span-2">
            <textarea
              className="field-base min-h-32"
              value={values.details}
              onChange={(e) => update("details", e.target.value)}
              placeholder="Ajoutez le contexte, les objections, les éléments clés de l’échange..."
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Rattachement CRM"
        description="Liez cette interaction aux objets métier concernés pour retrouver facilement le contexte."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact">
            <select
              className="field-base"
              value={values.contactId ?? ""}
              onChange={(e) => update("contactId", e.target.value || null)}
            >
              <option value="">Aucun contact</option>
              {contacts.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Bien">
            <select
              className="field-base"
              value={values.propertyId ?? ""}
              onChange={(e) => update("propertyId", e.target.value || null)}
            >
              <option value="">Aucun bien</option>
              {properties.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Demande">
            <select
              className="field-base"
              value={values.searchRequestId ?? ""}
              onChange={(e) => update("searchRequestId", e.target.value || null)}
            >
              <option value="">Aucune demande</option>
              {searchRequests.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Dossier">
            <select
              className="field-base"
              value={values.dealId ?? ""}
              onChange={(e) => update("dealId", e.target.value || null)}
            >
              <option value="">Aucun dossier</option>
              {deals.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
