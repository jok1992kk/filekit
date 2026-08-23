import { cn } from "@/lib/utils";

/**
 * The `.btn` rules from design-ref/filekit-home.html, as a class builder.
 * The reference applies them to plain anchors and buttons alike, so this stays
 * a class function rather than a wrapper component.
 */
export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "default" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-ctl text-[15px] font-medium border border-transparent whitespace-nowrap transition-[background-color,border-color,color] duration-150 ease-[ease]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#111111] text-white hover:bg-black",
  ghost: "bg-white text-ink border-border hover:border-border-strong hover:bg-surface",
};

const sizes: Record<ButtonSize, string> = {
  default: "",
  sm: "h-9 px-[14px] text-[14px]",
};

export function buttonClass({
  variant = "primary",
  size = "default",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], block && "w-full", className);
}
