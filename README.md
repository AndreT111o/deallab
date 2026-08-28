# DealLab — AI M&A Analyst

**From company to investment decision.**

DealLab turns a public company ticker into a structured, institutional-style
analysis: company overview, historical financials, DCF and comps valuation,
an M&A attractiveness framework, and an AI-generated investment memo.

This is the **Phase 1–5 MVP** described in the product spec, built as a real,
runnable Next.js codebase (not a mockup).

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Search or click **Ferrari (RACE)**
— it's the one fully-built demo company end to end. Every other ticker
correctly reports "coming soon" rather than fabricating data.

Run the calculation-engine test suite:

```bash
npm test
```

Build for production:

```bash
npm run build && npm start
```

### Optional: live AI Analyst

Without any setup, the AI Analyst module (summary, M&A narrative, memo
content) serves a curated demo analysis. To call OpenAI live instead:

```bash
cp .env.example .env.local
# then set OPENAI_API_KEY=sk-...
```

Financial math (DCF, comps, multiples, M&A score) **never** depends on this
key — see "Financial engineering rule" below.

---

## What's built

| Module | Status |
|---|---|
| Landing page, search, demo suggestions | ✅ |
| Company overview + key metrics | ✅ |
| Historical financials, charts, historical/forecast toggle | ✅ |
| Trading multiples (current / 5Y avg / peer median) | ✅ |
| Interactive DCF with per-year editable assumptions | ✅ |
| WACC × terminal-growth sensitivity matrix | ✅ |
| Comparable companies table (add/remove peers) + percentile stats | ✅ |
| Comps-implied valuation (P25/median/P75) | ✅ |
| Football field chart | ✅ |
| M&A attractiveness score (transparent, component-level) | ✅ |
| Investment highlights, rationale, buyer types, risks | ✅ |
| Bull / Base / Bear scenarios | ✅ |
| AI-generated investment memo (Markdown export + print-to-PDF) | ✅ |
| Educational-mode glossary tooltips | ✅ |
| User accounts, saved watchlist | 🔜 (types + `WatchlistItem` scaffolded, no auth/DB wired) |
| LBO module, precedent transactions, deal screener, QoE, Excel/PPT export | 🔜 (explicitly out of MVP scope per spec) |

Only **Ferrari (RACE)** has a full demo bundle. Everything else in search
routes to a "coming soon" state — the app never fabricates financial data.

---

## Architecture

```
app/                          Next.js App Router
  page.tsx                    Landing page
  company/[ticker]/page.tsx   Server component — fetches CompanyBundle via provider
components/
  ui/                         Hand-rolled shadcn-style primitives (Button, Card, Tabs, Badge...)
  company/                    Header, metric tiles, score bars
  landing/                    Search box, ticker strip
features/                     One folder per product module (company-overview,
                               financials, valuation, comps, ma-analysis, memo) —
                               each owns its own components, no giant files
lib/
  calculations/                ⚠️ Deterministic financial engine — see below
  ai/generate-analyst-output.ts  OpenAI call + JSON schema validation
  finance-glossary.ts          Educational-mode tooltip content
services/
  financial-data-provider.ts   FinancialDataProvider interface (the swap point)
  providers/mock-provider.ts   Phase-1 implementation
  providers/ferrari-data.ts    Hand-curated DEMO DATA bundle
types/index.ts                 Every normalized domain object, shared everywhere
```

### Financial engineering rule

Per the product spec, **the LLM never performs financial math.** Every
number in the app — Enterprise Value, Equity Value, DCF, terminal value,
trading multiples, percentiles, the M&A score — is computed by pure,
synchronous, unit-tested TypeScript in `lib/calculations/`. The AI Analyst
(`lib/ai/generate-analyst-output.ts`) only ever receives already-computed
numbers and is asked to interpret them (summary, highlights, risks,
rationale, buyer types, bull/bear narrative) — its output is validated
against a strict JSON schema before it's ever rendered.

### Swapping in a live data provider

Everything reads company data through the `FinancialDataProvider` interface
(`services/financial-data-provider.ts`). To connect a real vendor:

1. Implement `FinancialDataProvider` against that vendor's API.
2. Change the one line in `services/index.ts` that instantiates the provider.

Nothing in `app/`, `features/`, or `lib/calculations/` needs to change.

### M&A score methodology

The M&A Attractiveness Score is explicitly **an analytical framework, not a
prediction** — this is stated in the UI itself. Four of six sub-scores
(Growth, Financial Quality, Balance Sheet, Valuation Attractiveness) are
computed from formulas documented in `lib/calculations/ma-score.ts`. Two
(Strategic Positioning, Consolidation Potential) are explicit analyst
judgment inputs curated in the data layer — never invented by the LLM at
render time.

---

## Testing

```bash
npm test
```

Covers the DCF engine (revenue build-up, discounting, Gordon Growth terminal
value, enterprise/equity value derivation, edge cases), percentile/summary
statistics (validated against Excel's `PERCENTILE.INC`), and the M&A scoring
engine (leverage penalty, valuation-premium penalty, score bounds).

---

## Design system

Off-white paper background, charcoal ink, a single restrained "deal green"
accent — deliberately not the crypto/retail-trading aesthetic. Fraunces
(display serif, used sparingly) + Inter (UI/body) + IBM Plex Mono (all
numbers, tickers, financial tables — tabular figures throughout). Dense,
aligned financial tables are treated as a first-class UI element, not an
afterthought.

---

## Disclaimer

DealLab is an analytical and educational platform. Information generated by
the platform does not constitute investment advice. All figures for Ferrari
N.V. (RACE) in this build are clearly labeled **DEMO DATA** — illustrative
approximations for product-demo purposes, not live financial data.
