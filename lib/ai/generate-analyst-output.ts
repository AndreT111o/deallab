import type { AIAnalystOutput, CompanyBundle, MARisk, PotentialBuyer } from "@/types";

/**
 * AI Analyst System
 * ------------------
 * Per the financial-engineering rule, the LLM is used ONLY for qualitative
 * synthesis (summary, highlights, risks, rationale, buyer types, bull/bear
 * narrative, conclusion). All numbers referenced in the prompt are already
 * computed deterministically upstream (lib/calculations/*) — the model is
 * asked to interpret them, never to calculate them.
 *
 * This function calls OpenAI's Chat Completions API with response_format:
 * "json_object" when OPENAI_API_KEY is configured, validates the shape of
 * the response, and throws rather than displaying malformed output. When no
 * key is configured (e.g. local dev / this demo), it returns the bundle's
 * pre-curated `analystAnalysis` so the UI always has something real to show.
 */

const SYSTEM_PROMPT = `You are a senior M&A analyst. You will be given a JSON object with a
company's overview, historical financials, margins, leverage, valuation
multiples, and peer comparison. Respond ONLY with a JSON object matching
exactly this schema, with no markdown fences and no additional keys:

{
  "summary": string,
  "investment_highlights": string[],
  "risks": [{ "label": string, "level": "Low" | "Medium" | "High", "note": string }],
  "ma_rationale": string[],
  "buyer_types": [{ "category": string, "rationale": string }],
  "bull_case": string,
  "bear_case": string,
  "conclusion": string
}

Rules:
- Never invent financial figures. Reference only the numbers provided.
- The M&A framing is analytical, not predictive — never assert the company
  will or won't be acquired.
- Keep each string concise and institutional in tone.`;

function buildUserPrompt(bundle: CompanyBundle): string {
  const latest = bundle.financials[bundle.financials.length - 1];
  const bs = bundle.balanceSheet[bundle.balanceSheet.length - 1];
  const val = bundle.valuation[bundle.valuation.length - 1];

  return JSON.stringify({
    company: {
      name: bundle.company.name,
      ticker: bundle.company.ticker,
      sector: bundle.company.sector,
      industry: bundle.company.industry,
      description: bundle.company.description,
    },
    latestFinancials: latest,
    balanceSheet: bs,
    valuation: val,
    peers: bundle.peers.map((p) => ({
      name: p.name,
      evEbitda: p.evEbitda,
      evRevenue: p.evRevenue,
      pe: p.pe,
    })),
    maScoreBreakdown: bundle.maScore,
  });
}

function isValidAIAnalystOutput(value: unknown): value is AIAnalystOutput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const isStringArray = (x: unknown) =>
    Array.isArray(x) && x.every((i) => typeof i === "string");
  const isRiskArray = (x: unknown) =>
    Array.isArray(x) &&
    x.every(
      (i): i is MARisk =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as MARisk).label === "string" &&
        ["Low", "Medium", "High"].includes((i as MARisk).level) &&
        typeof (i as MARisk).note === "string"
    );
  const isBuyerArray = (x: unknown) =>
    Array.isArray(x) &&
    x.every(
      (i): i is PotentialBuyer =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as PotentialBuyer).category === "string" &&
        typeof (i as PotentialBuyer).rationale === "string"
    );

  return (
    typeof v.summary === "string" &&
    isStringArray(v.investment_highlights) &&
    isRiskArray(v.risks) &&
    isStringArray(v.ma_rationale) &&
    isBuyerArray(v.buyer_types) &&
    typeof v.bull_case === "string" &&
    typeof v.bear_case === "string" &&
    typeof v.conclusion === "string"
  );
}

export async function generateAnalystOutput(
  bundle: CompanyBundle
): Promise<AIAnalystOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // No live key configured — serve the curated demo analysis so the
    // memo module still has real, reviewed content to render.
    return bundle.analystAnalysis;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(bundle) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI Analyst request failed: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI Analyst returned malformed JSON.");
  }

  if (!isValidAIAnalystOutput(parsed)) {
    throw new Error("AI Analyst output failed schema validation.");
  }

  return parsed;
}
