"use client";

import {
  CONFIDENTIALITY_LEVELS,
  DOCUMENT_TYPES,
  type ConfidentialityLevelValue,
  type DocumentTypeValue,
} from "@/lib/client-options";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TargetProps = {
  propertyId?: string;
  dealId?: string;
  fieldSpottingId?: string;
  searchRequestId?: string;
  contactId?: string;
};

type Props = TargetProps & {
  title?: string;
  compact?: boolean;
};

export function DocumentUpload({
  propertyId,
  dealId,
  fieldSpottingId,
  searchRequestId,
  contactId,
  title = "Ajouter un document",
}: Props) {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<DocumentTypeValue>("DOCUMENT_INTERNE");
  const [visibility, setVisibility] = useState<ConfidentialityLevelValue>("INTERNAL");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Sélectionne un document.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("visibility", visibility);
    if (propertyId) formData.append("propertyId", propertyId);
    if (dealId) formData.append("dealId", dealId);
    if (fieldSpottingId) formData.append("fieldSpottingId", fieldSpottingId);
    if (searchRequestId) formData.append("searchRequestId", searchRequestId);
    if (contactId) formData.append("contactId", contactId);

    try {
      const response = await fetch("/api/uploads/documents", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Upload impossible");
      }
      setMessage("Document ajouté avec succès.");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-[#fbf8f4] p-4">
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <p className="mt-1 text-sm text-[#6b665f]">Formats acceptés : PDF, images, DOC, DOCX, TXT.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-[#6b665f]">Type</span>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentTypeValue)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
          >
            {DOCUMENT_TYPES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-[#6b665f]">Visibilité</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ConfidentialityLevelValue)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
          >
            {CONFIDENTIALITY_LEVELS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#6b665f]">Fichier</span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
        />
      </label>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Ajouter le document"}
      </button>
    </form>
  );
}
