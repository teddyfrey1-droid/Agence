"use client";

import { useState } from "react";
import { PublicFormFeedback } from "@/components/public/public-form-feedback";
import { PublicFormShell } from "@/components/public/public-form-shell";
import { publicContactLeadSchema } from "@/modules/public-leads/public-lead.schema";

export default function ContactClientForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const payload = { fullName, email, phone, message, company };
    const parsed = publicContactLeadSchema.safeParse(payload);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(firstError ?? "Merci de vérifier les informations saisies.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Impossible d’envoyer le message");

      setSuccess("Votre message a bien été transmis. Nous reviendrons vers vous rapidement.");
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCompany("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicFormShell
      eyebrow="Contact"
      title="Parler de votre projet"
      description="Recherche, cession, commercialisation confidentielle ou question plus générale : laissez-nous un message clair, nous reviendrons vers vous rapidement."
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
            <span className="text-sm font-medium">Message</span>
            <textarea className="field-base min-h-40" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Décrivez votre besoin, votre timing ou les points sur lesquels vous souhaitez être rappelé." />
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

        <PublicFormFeedback success={success} error={error} />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
            {loading ? "Envoi..." : "Envoyer"}
          </button>
          <span className="text-xs text-[#7a7066]">
            Réponse rapide, claire et confidentielle.
          </span>
        </div>
      </form>
    </PublicFormShell>
  );
}
