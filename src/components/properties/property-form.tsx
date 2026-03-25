"use client";

import { useState } from "react";
import {
  ASSET_TYPES,
  CONFIDENTIALITY_LEVELS,
  PROPERTY_SOURCE_TYPES,
  PROPERTY_STATUSES,
  type AssetTypeValue,
  type ConfidentialityLevelValue,
  type PropertySourceTypeValue,
  type PropertyStatusValue,
} from "@/lib/client-options";
import { CheckboxField, Field, FormActions, FormSection } from "@/components/ui/form-primitives";

export type PropertyFormValues = {
  internalTitle: string;
  propertyReference: string;
  status: PropertyStatusValue;
  confidentialityLevel: ConfidentialityLevelValue;
  sourceType: PropertySourceTypeValue;
  assetType: AssetTypeValue;
  addressLine1: string;
  postalCode: string;
  city: string;
  arrondissement: string;
  neighborhood: string;
  monthlyRent: string;
  salePrice: string;
  totalArea: string;
  extractionAvailable: boolean | null;
  internalComment: string;
  isPublishable: boolean;
};

type Props = {
  initialValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  submitLabel?: string;
};

const defaultValues: PropertyFormValues = {
  internalTitle: "",
  propertyReference: "",
  status: "DRAFT",
  confidentialityLevel: "INTERNAL",
  sourceType: "MANUAL",
  assetType: "LOCAL_COMMERCIAL",
  addressLine1: "",
  postalCode: "",
  city: "Paris",
  arrondissement: "",
  neighborhood: "",
  monthlyRent: "",
  salePrice: "",
  totalArea: "",
  extractionAvailable: null,
  internalComment: "",
  isPublishable: false,
};

export function PropertyForm({ initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<PropertyFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
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
        title="Informations essentielles"
        description="Créez une fiche exploitable immédiatement, puis enrichissez-la plus tard."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titre interne" className="md:col-span-2">
            <input className="field-base" value={values.internalTitle} onChange={(e) => update("internalTitle", e.target.value)} required />
          </Field>
          <Field label="Référence interne">
            <input className="field-base" value={values.propertyReference} onChange={(e) => update("propertyReference", e.target.value)} />
          </Field>
          <Field label="Type de bien">
            <select className="field-base" value={values.assetType} onChange={(e) => update("assetType", e.target.value as AssetTypeValue)}>
              {ASSET_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Statut">
            <select className="field-base" value={values.status} onChange={(e) => update("status", e.target.value as PropertyStatusValue)}>
              {PROPERTY_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Confidentialité">
            <select className="field-base" value={values.confidentialityLevel} onChange={(e) => update("confidentialityLevel", e.target.value as ConfidentialityLevelValue)}>
              {CONFIDENTIALITY_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Source">
            <select className="field-base" value={values.sourceType} onChange={(e) => update("sourceType", e.target.value as PropertySourceTypeValue)}>
              {PROPERTY_SOURCE_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Adresse et métriques" description="Les informations clés pour filtrer et matcher rapidement.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Adresse" className="md:col-span-2"><input className="field-base" value={values.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} /></Field>
          <Field label="Code postal"><input className="field-base" value={values.postalCode} onChange={(e) => update("postalCode", e.target.value)} /></Field>
          <Field label="Ville"><input className="field-base" value={values.city} onChange={(e) => update("city", e.target.value)} /></Field>
          <Field label="Arrondissement"><input className="field-base" value={values.arrondissement} onChange={(e) => update("arrondissement", e.target.value)} /></Field>
          <Field label="Quartier"><input className="field-base" value={values.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} /></Field>
          <Field label="Loyer mensuel"><input className="field-base" value={values.monthlyRent} onChange={(e) => update("monthlyRent", e.target.value)} /></Field>
          <Field label="Prix de vente"><input className="field-base" value={values.salePrice} onChange={(e) => update("salePrice", e.target.value)} /></Field>
          <Field label="Surface totale"><input className="field-base" value={values.totalArea} onChange={(e) => update("totalArea", e.target.value)} /></Field>
          <Field label="Extraction">
            <select className="field-base" value={values.extractionAvailable === null ? "unknown" : values.extractionAvailable ? "true" : "false"} onChange={(e) => update("extractionAvailable", e.target.value === "unknown" ? null : e.target.value === "true") }>
              <option value="unknown">Inconnu</option><option value="true">Oui</option><option value="false">Non</option>
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Note interne" description="Ajoutez les éléments terrain, le pitch commercial ou les réserves importantes.">
        <Field label="Commentaire interne" className="block">
          <textarea className="field-base min-h-32" value={values.internalComment} onChange={(e) => update("internalComment", e.target.value)} />
        </Field>
        <div className="mt-4">
          <CheckboxField checked={values.isPublishable} onChange={(checked) => update("isPublishable", checked)} label="Bien publiable" description="Autorise la préparation d'une fiche publique à partir de ce bien." />
        </div>
      </FormSection>

      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
