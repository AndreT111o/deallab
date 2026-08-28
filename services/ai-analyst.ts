import type {
  AIAnalystOutput,
  BalanceSheet,
  Company,
  FinancialStatement,
  MAScoreBreakdown,
  PeerCompany,
  ValuationMetrics,
} from "@/types";

/**
 * AI Analyst — live narrative generation
 * ----------------------------------------
 * Calls OpenAI (Structured Outputs) to produce the AIAnalystOutput shown on
 * the AI Analyst tab, grounded strictly in the real financials/valuation/
 * peers/M&A-score already computed for the company — the model is never
 * asked to invent figures, only to interpret numbers we hand it.
 *
 * Financial engineering rule (see lib/calculations/dcf.ts): valuation math
 * is never delegated to the LLM. This module only ever produces prose
 * commentary — the underlying numbers always come from lib/calculations/.
 *
 * Cost controls for the MVP stage:
 * - Uses gpt-4o-mini (cheap, fast, supports Structured Outputs).
 * - Responses are cached per-ticker for 24h via Next.js's fetch cache.
 * - Falls back to a clearly-labelled placeholder on any error, timeout, or
 *   missing OPENAI_API_KEY, rather than blocking the page or fabricating.
 *
 * Known gap, by design: there's no per-user rate limiting yet, because
 * there's no user system yet (roadmap Fase 2, item 1-2). Once auth + a DB
 * exist, add per-user request limits here before this gets real traffic —
 * an unauthenticated, unlimited LLM endpoint is a cost/abuse risk.
 */

const BUYER_CATEGORIES = [
  "Global strategic competitor",
  "Adjacent industry player",
  "Large-cap private equity fund",
  "Infrastructure investor",
  "Sovereign wealth fund",
  "Family office / long-term holder",
] as const;

const RISK_LEVELS = ["Low", "Medium", "High"] as const;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    investment_highlights: { type: "array", items: { type: "string" } },
    risks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          level: { type: "string", enum: RISK_LEVELS },
          note: { type: "string" },
        },
        required: ["label", "level", "note"],
      },
    },
    ma_rationale: { type: "array", items: { type: "string" } },
    buyer_types: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "string", enum: BUYER_CATEGORIES },
          rationale: { type: "string" },
        },
        required: ["category", "rationale"],
      },
    },
    bull_case: { type: "string" },
    bear_case: { type: "string" },
    conclusion: { type: "string" },
  },
  required: [
    "summary",
    "investment_highlights",
    "risks",
    "ma_rationale",
    "buyer_types",
    "bull_case",
    "bear_case",
    "conclusion",
  ],
} as const;

function buildPrompt(
  company: Company,
  financials: FinancialStatement[],
  balanceSheet: BalanceSheet[],
  valuation: ValuationMetrics[],
  peers: PeerCompany[],
  maScore: MAScoreBreakdown
): string {
  const latestF = financials[financials.length - 1];
  const latestB = balanceSheet[balanceSheet.length - 1];
  const latestV = valuation[valuation.length - 1];

  return `You are a professional M&A / equity research analyst writing for DealLab, an educational M&A analysis tool. Base your analysis STRICTLY on the data provided below — never invent specific figures, deals, dates, or facts not present here. If you're uncertain about something, write in general/qualitative terms rather than fabricating a number.

Write in the style of institutional sell-side / M&A advisory research: precise, unsentimental, evidence-based. The M&A score below is an analytical framework, not a prediction of an actual transaction — treat it and frame your writing that way (see the existing 'conclusion' style: acknowledge when a deal is unlikely rather than talking it up).

COMPANY
${company.name} (${company.ticker}), ${company.sector} / ${company.industry}, ${company.country}, listed on ${company.exchange}.
Description: ${company.description}

LATEST FINANCIALS (FY${latestF.year}, ${company.currency}m)
Revenue: ${latestF.revenue.toFixed(0)} (YoY growth: ${latestF.revenueGrowth != null ? (latestF.revenueGrowth * 100).toFixed(1) + "%" : "n/a"})
EBITDA: ${latestF.ebitda.toFixed(0)} (margin: ${(latestF.ebitdaMargin * 100).toFixed(1)}%)
EBIT: ${latestF.ebit.toFixed(0)} (margin: ${(latestF.ebitMargin * 100).toFixed(1)}%)
Net income: ${latestF.netIncome.toFixed(0)}
Free cash flow: ${latestF.freeCashFlow.toFixed(0)}

BALANCE SHEET (FY${latestB.year})
Cash: ${latestB.cash.toFixed(0)}, Total debt: ${latestB.totalDebt.toFixed(0)}, Net debt: ${latestB.netDebt.toFixed(0)}
Net Debt / EBITDA: ${latestF.ebitda !== 0 ? (latestB.netDebt / latestF.ebitda).toFixed(2) + "x" : "n/a"}

VALUATION (FY${latestV?.year ?? latestF.year})
Market cap: ${latestV?.marketCap.toFixed(0) ?? "n/a"}, Enterprise value: ${latestV?.enterpriseValue.toFixed(0) ?? "n/a"}
EV/EBITDA: ${latestV?.evEbitda.toFixed(1) ?? "n/a"}x, EV/Revenue: ${latestV?.evRevenue.toFixed(1) ?? "n/a"}x, P/E: ${latestV?.pe.toFixed(1) ?? "n/a"}x

PEERS
${peers.length > 0 ? peers.map((p) => `- ${p.name} (${p.ticker}): EV/EBITDA ${p.evEbitda.toFixed(1)}x, EBITDA margin ${(p.ebitdaMargin * 100).toFixed(1)}%, revenue growth ${(p.revenueGrowth * 100).toFixed(1)}%`).join("\n") : "No peer data available."}

M&A SCORE (0-100 scale, already computed deterministically — do not recompute or contradict these numbers, just interpret them)
Overall: ${maScore.overall}
- Strategic attractiveness: ${maScore.strategicAttractiveness} (neutral default — no analyst judgment curated for this company yet)
- Financial quality: ${maScore.financialQuality}
- Valuation attractiveness: ${maScore.valuationAttractiveness}
- Growth profile: ${maScore.growthProfile}
- Balance sheet: ${maScore.balanceSheet}
- Industry consolidation potential: ${maScore.industryConsolidation} (neutral default — no analyst judgment curated for this company yet)

Note: the strategic attractiveness and industry consolidation sub-scores are neutral 50/100 placeholders (no human analyst has curated a judgment call for this company yet) — mention this limitation naturally if relevant, don't present those two sub-scores as meaningful signal.

Produce the analysis now, matching the required JSON schema exactly.`;
}

function placeholderOutput(companyName: string, reason: string): AIAnalystOutput {
  const note = `Live AI-generated analysis for ${companyName} is unavailable right now (${reason}).`;
  return {
    summary: note,
    investment_highlights: [note],
    risks: [{ label: "AI Analyst unavailable", level: "Medium", note }],
    ma_rationale: [note],
    buyer_types: [],
    bull_case: note,
    bear_case: note,
    conclusion: note,
  };
}

export async function generateAIAnalystOutput(
  company: Company,
  financials: FinancialStatement[],
  balanceSheet: BalanceSheet[],
  valuation: ValuationMetrics[],
  peers: PeerCompany[],
  maScore: MAScoreBreakdown
): Promise<AIAnalystOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return placeholderOutput(
      company.name,
      "OPENAI_API_KEY is not configured"
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      // Cache per-company for 24h — same ticker won't re-trigger a paid
      // call on every page view.
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 1800,
        messages: [
          {
            role: "user",
            content: buildPrompt(
              company,
              financials,
              balanceSheet,
              valuation,
              peers,
              maScore
            ),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ai_analyst_output",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI response had no content");

    return JSON.parse(content) as AIAnalystOutput;
  } catch (err) {
    console.error(`generateAIAnalystOutput(${company.ticker}) failed:`, err);
    return placeholderOutput(company.name, "the analysis request failed");
  }
}
