import PropertySubmissionForm from "./property-submission-client";

export default function PropertySubmissionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Propriétaires & bailleurs</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Proposer un bien au cabinet</h1>
        <p className="mt-4 text-sm leading-8 text-[#5f564c]">
          Déposez votre actif, une demande d’avis ou une intention de commercialisation. L’information est reprise directement dans l’outil de l’agence pour être qualifiée rapidement.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <PropertySubmissionForm />
        <div className="space-y-6">
          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Traitement</div>
            <p className="mt-4 text-sm leading-7 text-[#5f564c]">
              Le bien est structuré dès son entrée, rattaché à un contact, classé puis qualifié. Cette organisation permet un traitement propre et une relance rapide.
            </p>
          </div>

          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Confidentialité</div>
            <p className="mt-4 text-sm leading-7 text-[#5f564c]">
              Les opportunités sensibles peuvent être travaillées en toute discrétion, avec une logique de diffusion maîtrisée et un suivi très précis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
