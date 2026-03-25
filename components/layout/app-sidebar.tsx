"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RoleCodeValue } from "@/lib/client-options";

import { LogoutButton } from "@/components/auth/logout-button";

type SidebarUser = {
  id: string;
  fullName: string;
  email: string;
  role: RoleCodeValue;
};

type Props = {
  user: SidebarUser;
};

const navigation = [
  { href: "/app/accueil", label: "Accueil" },
  { href: "/app/biens", label: "Biens" },
  { href: "/app/demandes", label: "Demandes" },
  { href: "/app/contacts", label: "Contacts" },
  { href: "/app/terrain", label: "Terrain" },
  { href: "/app/dossiers", label: "Dossiers" },
  { href: "/app/taches", label: "Tâches" },
  { href: "/app/interactions", label: "Interactions" },
  { href: "/app/carte", label: "Carte" },
  { href: "/app/performance", label: "Performance" },
];

export function AppSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-black/10 bg-[#171717] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/app/accueil" className="block">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">
            Cabinet
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            Premium Retail
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "block rounded-xl px-4 py-3 text-sm transition",
                isActive
                  ? "bg-white text-[#171717] shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-sm font-medium">{user.fullName}</div>
          <div className="mt-1 text-xs text-white/60">{user.email}</div>
          <div className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
            {user.role}
          </div>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
