import { cn } from "@/lib/utils";

export function ScoreBar({
  label,
  value,
  size = "md",
}: {
  label: string;
  value: number;
  size?: "sm" | "md";
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className={cn(
            "text-ink-muted",
            size === "sm" ? "text-2xs" : "text-xs"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "font-mono tabular text-ink",
            size === "sm" ? "text-2xs" : "text-xs"
          )}
        >
          {value}
        </span>
      </div>
      <div
        className={cn(
          "w-full overflow-hidden rounded-sm bg-surface-sunken",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className="h-full rounded-sm bg-deal animate-grow-x"
          style={
            {
              "--target-width": `${value}%`,
              width: `${value}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
