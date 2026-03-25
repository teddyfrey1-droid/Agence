import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function PublicFormShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-line bg-[#fbf8f4] px-6 py-6 md:px-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a7e71]">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f564c]">
          {description}
        </p>
      </div>

      <div className="px-6 py-6 md:px-8">
        {children}
      </div>

      {footer ? (
        <div className="border-t border-line bg-[#fbf8f4] px-6 py-5 md:px-8">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
