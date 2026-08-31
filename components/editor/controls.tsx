import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The editor's form primitives, shared by the marketing demo
 * (`ToolControls`) and the real workspace (`WorkspaceControls`) so both rails
 * look like the same product.
 */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="field-label mb-1.5 block text-[9.5px]">{label}</span>
      {children}
    </div>
  );
}

export function Segmented({
  values,
  value,
  onChange,
  disabled = false,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-white">
      {values.map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          onClick={() => onChange(item)}
          className={cn(
            "min-w-0 flex-1 border-r border-border px-1.5 py-1.5 text-[11px] last:border-r-0",
            item === value ? "bg-accent-tint font-medium text-accent" : "text-muted hover:bg-surface",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  children,
  disabled = false,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full appearance-none rounded-md border border-border bg-white px-2.5 pr-7 text-[11.5px] text-ink outline-none focus:border-accent"
      >
        {children}
      </select>
      <ChevronDown
        width={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Toggle({
  label,
  detail,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span>
        <span className="block text-[11.5px] text-ink">{label}</span>
        {detail ? <span className="block text-[10.5px] leading-[1.35] text-muted">{detail}</span> : null}
      </span>
      <span
        className={cn(
          "relative h-[18px] w-8 flex-none rounded-full transition-colors",
          checked ? "bg-accent" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-3 w-3 rounded-full bg-white transition-transform",
            checked ? "translate-x-[17px]" : "translate-x-[3px]",
          )}
        />
      </span>
    </button>
  );
}

export function StatBox({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface px-2.5 py-2 text-[11.5px]">
      <span className="font-medium text-ink">{primary}</span>
      <span className="text-[10.5px] text-muted">{secondary}</span>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      aria-label={label}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1.5 w-full accent-[var(--color-accent)]"
    />
  );
}
