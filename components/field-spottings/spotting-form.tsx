"use client";

import { useState } from "react";
import { SPOTTING_STATUSES, type SpottingStatusValue } from "@/lib/client-options";
import { CheckboxField, Field, FormActions, FormSection } from "@/components/ui/form-primitives";

export type SpottingFormValues = {
  spottingStatus: SpottingStatusValue;
  photoCoverUrl: string;
  addressText: string;
  postalCode: string;
  arrondissement: string;
  neighborhood: string;
  quickNote: string;
  ownerIdentified: boolean;
  ownerContacted: boolean;
  potentialType: string;
  storefrontVisible: boolean | null;
  apparentVacancyStatus: boolean | null;
  signagePresent: boolean | null;
  estimatedArea: string;
  estimatedLinearFrontage: string;
};

type Props = { initialValues?: Partial<SpottingFormValues>; onSubmit: (values: SpottingFormValues) => Promise<void>; submitLabel?: string; };

const defaultValues: SpottingFormValues = { spottingStatus: "SPOTTED", photoCoverUrl: "", addressText: "", postalCode: "", arrondissement: "", neighborhood: "", quickNote: "", ownerIdentified: false, ownerContacted: false, potentialType: "", storefrontVisible: null, apparentVacancyStatus: null, signagePresent: null, estimatedArea: "", estimatedLinearFrontage: "" };

function BooleanSelect({ value, onChange }: { value: boolean | null; onChange: (value: boolean | null) => void; }) {
  return <select className="field-base" value={value === null ? "unknown" : value ? "true" : "false"} onChange={(e) => onChange(e.target.value === "unknown" ? null : e.target.value === "true")}><option value="unknown">Inconnu</option><option value="true">Oui</option><option value="false">Non</option></select>;
}

export function SpottingForm({ initialValues, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<SpottingFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  function update<K extends keyof SpottingFormValues>(key: K, value: SpottingFormValues[K]) { setValues((prev) => ({ ...prev, [key]: value })); }
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setLoading(true); try { await onSubmit(values); } finally { setLoading(false); } }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Capture rapide" description="Enregistrez ce que vous voyez maintenant, enrichissez plus tard.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="URL photo de couverture" className="md:col-span-2"><input className="field-base" value={values.photoCoverUrl} onChange={(e) => update("photoCoverUrl", e.target.value)} placeholder="https://..." /></Field>
          <Field label="Adresse" className="md:col-span-2"><input className="field-base" value={values.addressText} onChange={(e) => update("addressText", e.target.value)} placeholder="Ex. 12 rue La Fayette" /></Field>
          <Field label="Code postal"><input className="field-base" value={values.postalCode} onChange={(e) => update("postalCode", e.target.value)} /></Field>
          <Field label="Arrondissement"><input className="field-base" value={values.arrondissement} onChange={(e) => update("arrondissement", e.target.value)} placeholder="9e" /></Field>
          <Field label="Quartier"><input className="field-base" value={values.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} /></Field>
          <Field label="Statut"><select className="field-base" value={values.spottingStatus} onChange={(e) => update("spottingStatus", e.target.value as SpottingStatusValue)}>{SPOTTING_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
        </div>
      </FormSection>
      <FormSection title="Qualification terrain" description="Renseignez les signaux visibles et les premières hypothèses commerciales.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Type potentiel"><input className="field-base" value={values.potentialType} onChange={(e) => update("potentialType", e.target.value)} placeholder="Local commercial, angle, cession probable..." /></Field>
          <Field label="Surface estimée"><input className="field-base" value={values.estimatedArea} onChange={(e) => update("estimatedArea", e.target.value)} placeholder="Ex. 85" /></Field>
          <Field label="Linéaire estimé"><input className="field-base" value={values.estimatedLinearFrontage} onChange={(e) => update("estimatedLinearFrontage", e.target.value)} placeholder="Ex. 6" /></Field>
          <Field label="Local vacant apparent"><BooleanSelect value={values.apparentVacancyStatus} onChange={(value) => update("apparentVacancyStatus", value)} /></Field>
          <Field label="Vitrine visible"><BooleanSelect value={values.storefrontVisible} onChange={(value) => update("storefrontVisible", value)} /></Field>
          <Field label="Enseigne présente"><BooleanSelect value={values.signagePresent} onChange={(value) => update("signagePresent", value)} /></Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CheckboxField checked={values.ownerIdentified} onChange={(checked) => update("ownerIdentified", checked)} label="Propriétaire identifié" description="Le repérage peut déjà être qualifié sur le plan du contact." />
          <CheckboxField checked={values.ownerContacted} onChange={(checked) => update("ownerContacted", checked)} label="Propriétaire contacté" description="Une première prise de contact a déjà été réalisée." />
        </div>
      </FormSection>
      <FormSection title="Note terrain" description="Conservez votre intuition et les informations utiles vues sur place.">
        <Field label="Commentaire" className="block"><textarea className="field-base min-h-32" value={values.quickNote} onChange={(e) => update("quickNote", e.target.value)} placeholder="Contexte terrain, intuition commerciale, informations visibles sur place..." /></Field>
      </FormSection>
      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
