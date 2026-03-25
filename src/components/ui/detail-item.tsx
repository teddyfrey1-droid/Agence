import type { ReactNode } from "react";
type Props = {
  label: string;
  value: ReactNode;
};

export function DetailItem({ label, value }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e71]">{label}</div>
      <div className="mt-2 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}
