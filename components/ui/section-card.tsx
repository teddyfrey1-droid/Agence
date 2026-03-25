import type { ReactNode } from "react";
type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function SectionCard({ title, description, children, action }: Props) {
  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#6b665f]">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
