import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
      <div className="text-sm uppercase tracking-[0.2em] text-neutral-400">Introuvable</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Élément introuvable</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">
        La fiche demandée n’existe pas, n’est plus accessible ou n’appartient pas à votre agence.
      </p>
      <div className="mt-6">
        <Link
          href="/app/accueil"
          className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
