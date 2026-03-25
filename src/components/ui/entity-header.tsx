import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

type Badge = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

type Props = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  badges?: Badge[];
  actions?: ReactNode;
};

export function EntityHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  badges = [],
  actions,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-[#6b665f]">
        <Link href={backHref} className="transition hover:text-ink hover:underline">
          {backLabel}
        </Link>
        <span className="mx-2 text-[#b4a89a]">/</span>
        <span className="text-ink">{title}</span>
      </div>

      <PageHeader title={title} description={subtitle} actions={actions} />

      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <StatusPill key={`${badge.label}-${badge.tone ?? "default"}`} tone={badge.tone}>
              {badge.label}
            </StatusPill>
          ))}
        </div>
      ) : null}
    </div>
  );
}
