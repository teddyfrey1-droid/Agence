"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  propertyId: string;
};

export function PropertyMediaUpload({ propertyId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Sélectionne une image.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("title", title);
    formData.append("isPublic", String(isPublic));
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads/property-media", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Upload impossible");
      }

      setMessage("Image ajoutée avec succès.");
      setTitle("");
      setFile(null);
      setIsPublic(false);
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
        <div className="text-sm font-medium text-ink">Ajouter une image</div>
        <p className="mt-1 text-sm text-[#6b665f]">Formats acceptés : JPG, PNG, WEBP, GIF.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#6b665f]">Titre optionnel</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
          placeholder="Façade, intérieur, plan..."
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#6b665f]">Fichier</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-ink">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Média publiable côté site public
      </label>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Ajouter l'image"}
      </button>
    </form>
  );
}
