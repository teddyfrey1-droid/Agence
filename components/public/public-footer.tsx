import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Premium Retail</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            Immobilier commercial, sur-mesure et haut de gamme à Paris.
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#6b665f]">
            Un cabinet pensé pour les emplacements exigeants, les recherches structurées et les
            commercialisations menées avec précision, discrétion et réactivité.
          </p>
        </div>

        <div>
          <div className="text-sm font-medium text-ink">Navigation</div>
          <div className="mt-4 space-y-3 text-sm text-[#6b665f]">
            <Link href="/agence" className="block hover:text-ink">Agence</Link>
            <Link href="/biens" className="block hover:text-ink">Biens disponibles</Link>
            <Link href="/recherche-local" className="block hover:text-ink">Déposer une recherche</Link>
            <Link href="/proposer-un-bien" className="block hover:text-ink">Proposer un bien</Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-ink">Contact</div>
          <div className="mt-4 space-y-3 text-sm text-[#6b665f]">
            <div>Paris · Immobilier commercial</div>
            <div>contact@premium-retail.fr</div>
            <div>+33 1 00 00 00 00</div>
            <Link href="/contact" className="inline-flex rounded-full border border-black/10 px-4 py-2 text-ink transition hover:bg-[#fbf8f4]">
              Nous écrire
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
