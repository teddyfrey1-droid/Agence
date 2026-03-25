import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Agence Immo Premium", description: "Plateforme premium d’immobilier commercial" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className="min-h-screen bg-[#f6f1ea] text-neutral-900 antialiased">{children}</body></html>;
}
