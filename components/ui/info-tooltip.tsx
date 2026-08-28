"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small "i" affordance used throughout the app for Educational Mode
 * (spec section 26). Keeps the concise explanation collapsed by default so
 * the product doesn't read as a finance course.
 */
export function InfoTooltip({
  term,
  explanation,
  className,
}: {
  term: string;
  explanation: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={`Explain ${term}`}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="text-ink-faint hover:text-deal transition-colors"
      >
        <Info size={12} strokeWidth={2.25} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-5 z-20 w-60 -translate-x-1/2 rounded-md border border-line bg-ink px-3 py-2.5 text-left text-2xs leading-relaxed text-paper shadow-card"
        >
          <span className="mb-1 block font-semibold tracking-wide text-paper/90">
            {term}
          </span>
          {explanation}
        </span>
      )}
    </span>
  );
}
