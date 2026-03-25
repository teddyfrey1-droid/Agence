"use client";

import { useState } from "react";
import {
  CONTACT_TYPES,
  PRIORITY_LEVELS,
  RELATIONSHIP_STAGES,
  type ContactTypeValue,
  type PriorityLevelValue,
  type RelationshipStageValue,
} from "@/lib/client-options";
import { FormActions, FormSection, Field } from "@/components/ui/form-primitives";

type Option = { id: string; label: string };

export type ContactFormValues = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  preferredContactMethod: string;
  source: string;
  contactTypePrimary: ContactTypeValue;
  activitySector: string;
  priorityLevel: PriorityLevelValue;
  relationshipStage: RelationshipStageValue;
  notesSummary: string;
  ownerUserId: string | null;
};

type Props = {
  users?: Option[];
  initialValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  submitLabel?: string;
};

const defaultValues: ContactFormValues = {
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  whatsappPhone: "",
  preferredContactMethod: "",
  source: "",
  contactTypePrimary: "PROSPECT",
  activitySector: "",
  priorityLevel: "MEDIUM",
  relationshipStage: "NEW",
  notesSummary: "",
  ownerUserId: null,
};

export function ContactForm({ users = [], initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<ContactFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
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
        title="Identité"
        description="Renseignez les informations essentielles pour retrouver et qualifier facilement ce contact."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom complet" className="md:col-span-2">
            <input
              className="field-base"
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </Field>

          <Field label="Prénom">
            <input className="field-base" value={values.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </Field>

          <Field label="Nom">
            <input className="field-base" value={values.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </Field>

          <Field label="Type principal">
            <select
              className="field-base"
              value={values.contactTypePrimary}
              onChange={(e) => update("contactTypePrimary", e.target.value as ContactTypeValue)}
            >
              {CONTACT_TYPES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>

          <Field label="Secteur / activité">
            <input className="field-base" value={values.activitySector} onChange={(e) => update("activitySector", e.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Coordonnées"
        description="Centralisez les canaux de contact pour les relances et le suivi commercial."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email">
            <input className="field-base" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} />
          </Field>

          <Field label="Téléphone">
            <input className="field-base" value={values.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>

          <Field label="WhatsApp">
            <input className="field-base" value={values.whatsappPhone} onChange={(e) => update("whatsappPhone", e.target.value)} />
          </Field>

          <Field label="Canal préféré">
            <input className="field-base" value={values.preferredContactMethod} onChange={(e) => update("preferredContactMethod", e.target.value)} placeholder="Téléphone, email, WhatsApp..." />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Suivi et pilotage"
        description="Définissez la priorité, l’étape relationnelle et le responsable du suivi."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Priorité">
            <select
              className="field-base"
              value={values.priorityLevel}
              onChange={(e) => update("priorityLevel", e.target.value as PriorityLevelValue)}
            >
              {PRIORITY_LEVELS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>

          <Field label="Étape relationnelle">
            <select
              className="field-base"
              value={values.relationshipStage}
              onChange={(e) => update("relationshipStage", e.target.value as RelationshipStageValue)}
            >
              {RELATIONSHIP_STAGES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>

          <Field label="Source">
            <input className="field-base" value={values.source} onChange={(e) => update("source", e.target.value)} placeholder="Site, téléphone, réseau, apporteur..." />
          </Field>

          <Field label="Responsable du suivi">
            <select
              className="field-base"
              value={values.ownerUserId ?? ""}
              onChange={(e) => update("ownerUserId", e.target.value || null)}
            >
              <option value="">Non assigné</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Notes de synthèse" className="md:col-span-2">
            <textarea
              className="field-base min-h-32"
              value={values.notesSummary}
              onChange={(e) => update("notesSummary", e.target.value)}
              placeholder="Contexte, attentes, historique, éléments utiles..."
            />
          </Field>
        </div>
      </FormSection>

      <FormActions
        submitLabel={loading ? "Enregistrement..." : submitLabel}
        disabled={loading}
      />
    </form>
  );
}
