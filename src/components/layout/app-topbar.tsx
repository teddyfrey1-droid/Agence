import type { RoleCodeValue } from "@/lib/client-options";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";

type TopbarUser = {
  id: string;
  fullName: string;
  email: string;
  role: RoleCodeValue;
};

type Props = {
  user: TopbarUser;
};

export function AppTopbar({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f6f1ea]/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-8">
        <div className="min-w-0 flex-1">
          <div className="max-w-xl">
            <input
              type="text"
              placeholder="Rechercher un bien, un contact, un dossier…"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-black/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/biens/new"
            className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
          >
            Créer un bien
          </Link>

          <div className="hidden rounded-2xl border border-black/10 bg-white px-4 py-3 text-right md:block">
            <div className="text-sm font-medium">{user.fullName}</div>
            <div className="text-xs text-neutral-500">{user.role}</div>
          </div>

          <div className="hidden md:block">
            <LogoutButton compact />
          </div>
        </div>
      </div>
    </header>
  );
}
