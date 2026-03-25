import ContactClientForm from "./contact-client";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e71]">Contact</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Parlons de votre projet ou de votre actif.</h1>
        <p className="mt-4 text-sm leading-8 text-[#5f564c]">
          Écrivez-nous. Le message est centralisé dans l’outil du cabinet pour un suivi propre et une reprise rapide.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <ContactClientForm />
        <div className="space-y-6">
          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Coordonnées</div>
            <div className="mt-4 space-y-3 text-sm text-[#5f564c]">
              <div>Paris · Immobilier commercial</div>
              <div>contact@premium-retail.fr</div>
              <div>+33 1 00 00 00 00</div>
            </div>
          </div>
          <div className="surface-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Engagement</div>
            <p className="mt-4 text-sm leading-7 text-[#5f564c]">
              Nous privilégions des prises de besoin claires, une réponse rapide et un accompagnement qui reste humain, précis et structuré.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
