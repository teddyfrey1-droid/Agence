import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  surface: string;
  extraction: string;
  status?: string;
};

export function PublicPropertyCard({ slug, title, subtitle, price, surface, extraction, status }: Props) {
  return (
    <Link href={`/biens/${slug}`} className="group surface-card block overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
      <div className="aspect-[4/3] bg-[linear-gradient(135deg,#ede5db_0%,#faf7f2_55%,#f4eee6_100%)]" />
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">{status ?? "Disponible"}</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink group-hover:text-black">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[#6b665f]">{subtitle}</p>
          </div>
          <div className="rounded-full border border-black/10 bg-[#fbf8f4] px-3 py-2 text-xs text-[#5f564c]">
            Voir
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Valeur</div>
            <div className="mt-1 text-sm font-medium text-ink">{price}</div>
          </div>
          <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Surface</div>
            <div className="mt-1 text-sm font-medium text-ink">{surface}</div>
          </div>
          <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">Extraction</div>
            <div className="mt-1 text-sm font-medium text-ink">{extraction}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
