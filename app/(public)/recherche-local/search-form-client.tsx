"use client";

import { useMemo, useState } from "react";
import { PublicFormFeedback } from "@/components/public/public-form-feedback";
import { PublicFormShell } from "@/components/public/public-form-shell";
import { publicSearchLeadSchema } from "@/modules/public-leads/public-lead.schema";

const arrs = ["1e","2e","3e","4e","5e","6e","7e","8e","9e","10e","11e","12e","13e","14e","15e","16e","17e","18e","19e","20e"];

export default function PublicSearchForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [activity, setActivity] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [targetArrondissements, setTargetArrondissements] = useState<string[]>([]);
  const [extractionRequired, setExtractionRequired] = useState<string>("unknown");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const parts = [];
    if (targetArrondissements.length) parts.push(targetArrondissements.join(", "));
    if (budgetMax) parts.push(`Budget max ${budgetMax} €`);
    if (areaMin) parts.push(`À partir de ${areaMin} m²`);
    if (activity) parts.push(activity);
    return parts.join(" · ");
  }, [activity, areaMin, budgetMax, targetArrondissements]);

  function toggleArr(value: string) {
    setTargetArrondissements((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const payload = {
      fullName,
      email,
      phone,
      activity,
      budgetMax,
      areaMin,
      targetArrondissements,
      extractionRequired:
        extractionRequired === "unknown" ? null : extractionRequired === "true",
      company,
    };

    const parsed = publicSearchLeadSchema.safeParse(payload);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(firstError ?? "Merci de vérifier les informations saisies.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/public/search-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Impossible d’envoyer votre demande");
      }

      setSuccess("Votre recherche a bien été transmise. Nous revenons vers vous rapidement avec un premier retour qualifié.");
      setFullName("");
      setEmail("");
      setPhone("");
      setActivity("");
      setBudgetMax("");
      setAreaMin("");
      setTargetArrondissements([]);
      setExtractionRequired("unknown");
      setCompany("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicFormShell
      eyebrow="Recherche"
      title="Décrire votre besoin"
      description="Déposez votre recherche en quelques minutes. Nous revenons vers vous avec un premier cadrage, puis une sélection réellement pertinente selon vos critères et votre calendrier."
      footer={
        <p className="text-xs leading-6 text-[#7a7066]">
          Vos informations sont utilisées uniquement pour traiter votre demande et organiser un retour qualifié.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Nom</span>
            <input className="field-base" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input type="email" className="field-base" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Téléphone</span>
            <input className="field-base" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Activité envisagée</span>
            <input className="field-base" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ex. restauration rapide, coffee shop, showroom..." />
          </label>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Zones ciblées</div>
          <div className="flex flex-wrap gap-2">
            {arrs.map((value) => {
              const active = targetArrondissements.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArr(value)}
                  className={`choice-pill ${active ? "choice-pill-active" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#7a7066]">
            Vous pouvez aussi déposer votre demande sans zone précise : nous vous aiderons à l’affiner.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">Budget max</span>
            <input className="field-base" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Ex. 250000" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Surface min</span>
            <input className="field-base" value={areaMin} onChange={(e) => setAreaMin(e.target.value)} placeholder="Ex. 70" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Extraction</span>
            <select className="field-base" value={extractionRequired} onChange={(e) => setExtractionRequired(e.target.value)}>
              <option value="unknown">À préciser</option>
              <option value="true">Obligatoire</option>
              <option value="false">Non obligatoire</option>
            </select>
          </label>
        </div>

        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
          aria-hidden="true"
        />

        {summary ? (
          <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-3 text-sm text-[#5f564c]">
            <span className="font-medium text-ink">Résumé :</span> {summary}
          </div>
        ) : null}

        <PublicFormFeedback success={success} error={error} />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
            {loading ? "Envoi..." : "Transmettre ma recherche"}
          </button>
          <span className="text-xs text-[#7a7066]">
            Retour qualifié généralement sous 24 h ouvrées.
          </span>
        </div>
      </form>
    </PublicFormShell>
  );
}
