"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/agence", label: "Agence" },
  { href: "/biens", label: "Biens" },
  { href: "/recherche-local", label: "Recherche" },
  { href: "/proposer-un-bien", label: "Proposer un bien" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f1ea]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 md:px-8">
        <Link href="/" className="shrink-0">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Cabinet parisien</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-ink">Premium Retail</div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-black text-white"
                    : "text-[#5f564c] hover:bg-white hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/recherche-local"
            className="hidden rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink shadow-sm transition hover:border-black/15 hover:bg-[#fbf8f4] md:inline-flex"
          >
            Rechercher un local
          </Link>
          <Link
            href="/app/accueil"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black/90"
          >
            Accès agence
          </Link>
        </div>
      </div>
    </header>
  );
}
