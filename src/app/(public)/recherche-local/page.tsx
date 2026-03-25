import PublicSearchForm from "./search-form-client";

export default function SearchLocalPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Recherche</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Déposer une recherche de local</h1>
        <p className="mt-4 text-sm leading-8 text-[#5f564c]">
          Partagez votre cahier des charges. La demande est injectée directement dans l’environnement de travail du cabinet, puis qualifiée pour un traitement rapide et structuré.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <PublicSearchForm />
        <div className="space-y-6">
          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Ce que nous cherchons à comprendre</div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5f564c]">
              <li>• votre activité et sa logique d’implantation</li>
              <li>• vos zones prioritaires et vos flexibilités</li>
              <li>• vos contraintes techniques essentielles</li>
              <li>• votre calendrier réel de décision</li>
            </ul>
          </div>

          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Positionnement</div>
            <p className="mt-4 text-sm leading-7 text-[#5f564c]">
              Nous privilégions un accompagnement précis : peu de bruit, des sélections cohérentes, des relances suivies et une vraie lecture commerciale des emplacements proposés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
