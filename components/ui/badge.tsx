import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "positive" | "negative" | "amber" | "deal";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-ink-muted border-line",
  positive: "bg-positive-soft text-positive border-positive/20",
  negative: "bg-negative-soft text-negative border-negative/20",
  amber: "bg-amber-soft text-amber border-amber/20",
  deal: "bg-deal-soft text-deal-strong border-deal/20",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-[0.04em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
