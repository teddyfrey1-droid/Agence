import Link from "next/link";

export default function PublicNotFound() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 md:px-8">
      <div className="surface-card p-8 md:p-10">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a7e71]">
          Page introuvable
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Cette page n’est plus disponible.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f564c]">
          Le lien a peut-être changé ou le bien n’est plus visible publiquement.
          Vous pouvez revenir à l’accueil ou consulter les biens actuellement publiés.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Retour à l’accueil
          </Link>
          <Link
            href="/biens"
            className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-[#fbf8f4]"
          >
            Voir les biens
          </Link>
        </div>
      </div>
    </section>
  );
}
