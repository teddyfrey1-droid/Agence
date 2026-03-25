"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  spottingId: string;
  disabled?: boolean;
};

export function ConvertSpottingButton({ spottingId, disabled }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    setLoading(true);
    try {
      const response = await fetch(`/api/field-spottings/${spottingId}/convert`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Impossible de convertir le repérage");
      }

      const json = await response.json();
      router.push(`/app/biens/${json.data.propertyId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleConvert}
      className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Conversion..." : "Convertir en bien"}
    </button>
  );
}
