"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={compact
        ? "rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-800 disabled:opacity-50"
        : "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/10 disabled:opacity-50"}
    >
      {loading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
