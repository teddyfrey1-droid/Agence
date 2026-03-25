import type { ReactNode } from "react";
import { SectionCard } from "@/components/ui/section-card";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      {children}
    </SectionCard>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={`space-y-2 ${className ?? ""}`.trim()}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[#8a7e71]">{hint}</span> : null}
    </label>
  );
}

type CheckboxFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function CheckboxField({ checked, onChange, label, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-line"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-[#8a7e71]">{description}</span> : null}
      </span>
    </label>
  );
}

type FormActionsProps = {
  loading: boolean;
  submitLabel: string;
};

export function FormActions({ loading, submitLabel }: FormActionsProps) {
  return (
    <div className="sticky bottom-0 flex justify-end border-t border-line bg-[#f6f1ea]/90 py-4 backdrop-blur">
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : submitLabel}
      </button>
    </div>
  );
}
