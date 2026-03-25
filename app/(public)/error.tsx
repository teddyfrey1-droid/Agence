"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-red-500">Erreur</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          La page n’a pas pu être chargée
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Réessayez. Si le problème persiste, vérifiez la configuration publique du projet et les listings publiés.
        </p>
        <pre className="mt-5 overflow-auto rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-500">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
