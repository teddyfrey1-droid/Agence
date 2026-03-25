"use client";

import { useMemo, useState } from "react";
import { PublicFormFeedback } from "@/components/public/public-form-feedback";
import { PublicFormShell } from "@/components/public/public-form-shell";
import { publicPropertySubmissionSchema } from "@/modules/public-leads/public-lead.schema";

export default function PropertySubmissionForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressText, setAddressText] = useState("");
  const [surface, setSurface] = useState("");
  const [rentOrPrice, setRentOrPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [photoCoverUrl, setPhotoCoverUrl] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const parts = [];
    if (addressText) parts.push(addressText);
    if (surface) parts.push(`${surface} m²`);
    if (rentOrPrice) parts.push(rentOrPrice);
    return parts.join(" · ");
  }, [addressText, surface, rentOrPrice]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const payload = {
      fullName,
      email,
      phone,
      addressText,
      surface,
      rentOrPrice,
      notes,
      photoCoverUrl,
      company,
    };

    const parsed = publicPropertySubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(firstError ?? "Merci de vérifier les informations saisies.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/public/property-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Impossible d’envoyer le bien");

      setSuccess("Votre proposition a bien été enregistrée. Nous reviendrons vers vous après un premier examen du dossier.");
      setFullName("");
      setEmail("");
      setPhone("");
      setAddressText("");
      setSurface("");
      setRentOrPrice("");
      setNotes("");
      setPhotoCoverUrl("");
      setCompany("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicFormShell
      eyebrow="Commercialisation"
      title="Présenter un bien à l’agence"
      description="Adresse, surfaces, éléments économiques et commentaires utiles : transmettez l’essentiel, nous complèterons ensuite avec vous les éléments de commercialisation."
      footer={
        <p className="text-xs leading-6 text-[#7a7066]">
          Nous traitons ces informations de manière confidentielle et les utilisons uniquement pour qualifier votre proposition.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <span className="text-sm font-medium">Adresse du bien</span>
            <input className="field-base" value={addressText} onChange={(e) => setAddressText(e.target.value)} required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Surface</span>
            <input className="field-base" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="Ex. 85" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Loyer ou prix</span>
            <input className="field-base" value={rentOrPrice} onChange={(e) => setRentOrPrice(e.target.value)} placeholder="Ex. 4 800 € / mois" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">URL photo (optionnel)</span>
            <input className="field-base" value={photoCoverUrl} onChange={(e) => setPhotoCoverUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Informations complémentaires</span>
            <textarea className="field-base min-h-40" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Disponibilité, configuration, activité possible, contexte du dossier..." />
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
            {loading ? "Envoi..." : "Transmettre le bien"}
          </button>
          <span className="text-xs text-[#7a7066]">
            Nous revenons vers vous après une première qualification du dossier.
          </span>
        </div>
      </form>
    </PublicFormShell>
  );
}
