import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARY } from "@/lib/finance-glossary";
import { cn } from "@/lib/utils";

export function MetricTile({
  label,
  value,
  sub,
  glossaryTerm,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  glossaryTerm?: keyof typeof GLOSSARY;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="border-r border-line px-5 py-4 last:border-r-0">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-2xs uppercase tracking-[0.06em] text-ink-faint">
          {label}
        </span>
        {glossaryTerm && (
          <InfoTooltip term={glossaryTerm} explanation={GLOSSARY[glossaryTerm]} />
        )}
      </div>
      <div
        className={cn(
          "font-mono text-xl tabular tracking-tight",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-2xs text-ink-faint">{sub}</div>}
    </div>
  );
}
