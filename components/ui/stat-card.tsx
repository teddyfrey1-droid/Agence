type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: Props) {
  return (
    <div className="surface-card p-5">
      <div className="text-sm text-[#6b665f]">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-2 text-xs text-[#8a7e71]">{hint}</div> : null}
    </div>
  );
}
