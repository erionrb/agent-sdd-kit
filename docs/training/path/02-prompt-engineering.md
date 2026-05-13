# 02 — Prompt Engineering

Writing a good prompt is the developer's core skill in the AI era. A well-structured prompt reduces tool calls, eliminates hallucinations, and produces code that matches your conventions on the first attempt.

---

## The anatomy of a quality prompt

Use a structured XML + Markdown format. Here's the skeleton:

```xml
<task>
  Brief one-line description of what to build.
</task>

<role>
  You are a senior full stack developer specializing in [stack].
</role>

<requirements>
  ### Business Requirements
  - ...

  ### Technical Requirements
  - ...
</requirements>

<endpoints>
  ### [Endpoint name]
  URL: ...
  Auth: ...
  Response: (paste actual payload contract here)
</endpoints>

<tests>
  - Curl command to validate endpoint X
</tests>

<critical>
  Out of scope:
  - [list what NOT to do]

  IMPORTANT: [most critical rule stated once]

  IMPORTANT: [same most critical rule repeated]
</critical>
```

Each section has a specific job.

---

## Role definition

```xml
<role>
  You are a senior full stack developer specializing in React, Node.js, and ethers.js.
</role>
```

Without this, the LLM must infer your stack from the codebase, which costs tool calls (it will read `package.json`, check imports, etc.) and introduces ambiguity.

With the role defined:

- No need to discover the stack — it's stated.
- The model applies the right idioms, patterns, and mental model immediately.
- Token savings on every project with a defined stack.

---

## Requirements: business and technical

Split requirements into two clear layers:

**Business requirements** — what the user sees and experiences:

- Display token prices in cards: symbol, current price (USD), 24h change %, market cap
- Auto-refresh portfolio value every 30 seconds
- Sort tokens by 24h change, descending

**Technical requirements** — constraints and architecture decisions:

- Frontend consumes backend API only (never call the external API directly from frontend)
- TypeScript with strict mode
- API key must live in `.env`, never hardcoded

Mixing these two layers produces unclear prompts. Business requirements tell the AI what to build. Technical requirements tell it how to constrain the solution.

---

## Endpoints section

If your feature consumes an external API, paste the contract directly into the prompt. The alternative is the LLM doing a web search, which costs extra tool calls and may return outdated docs.

```xml
<endpoints>
  ### CoinGecko API - Token Prices
  URL: https://api.coingecko.com/api/v3/simple/price
  Auth: Header `x-cg-demo-api-key: {API_KEY}`
  Params: ids=bitcoin,ethereum,chainlink&vs_currencies=usd&include_24hr_change=true&include_market_cap=true

  Response:
  {
    "bitcoin":  { "usd": 67420.00, "usd_24h_change": 2.35,  "usd_market_cap": 1328000000000 },
    "ethereum": { "usd": 3540.00,  "usd_24h_change": -1.12, "usd_market_cap": 425000000000  },
    "chainlink":{ "usd": 14.82,    "usd_24h_change": 0.87,  "usd_market_cap": 9200000000    }
  }
</endpoints>
```

This eliminates web search calls entirely for API integration work. Without the contract, the LLM resorts to web search — extra turns and tokens for results that may be outdated. Pasting the contract avoids that entirely.

---

## Critical section

The `<critical>` section is intentionally named for its weight. LLMs are trained to pay attention to words like "IMPORTANT", "critical", "never". Use this section for:

1. **Out-of-scope list** — explicit list of what NOT to build. Prevents scope creep and wasted implementation.
2. **The most important rule, repeated twice** — repetition increases the probability the model follows it. A rule stated once can be outweighed by other context. Stating it twice raises its weight in the attention mechanism.

```xml
<critical>
  Out of scope:
  - Do not implement light/dark theme toggle
  - Do not add comments inside the code

  IMPORTANT: The frontend must never call the CoinGecko API directly. All external API calls go through the backend.

  IMPORTANT: The frontend must never call the CoinGecko API directly. All external API calls go through the backend.
</critical>
```

Why repeat? The LLM weights tokens probabilistically. Stating the same rule twice increases its weight in the attention mechanism — the model is less likely to override it mid-generation.

---

## Before/after example

### Before (vague)

```
Build a token price dashboard using CoinGecko. Show prices for BTC, ETH and LINK.
```

What the LLM does with this:

1. `web_search("CoinGecko API documentation")` — to find the endpoint
2. `list_dir(".")` — to understand the project structure
3. `read_file("package.json")` — to discover the stack
4. Decides to call the API directly from the frontend (no constraint against it)
5. No TypeScript strict mode (no requirement stated)
6. Possibly adds a wallet connect button because it seems "relevant for Web3"

Result: more token consumption, inconsistent architecture choices, scope creep.

### After (structured)

```xml
<task>
  Implement a DeFi token price dashboard displaying real-time prices from the CoinGecko API.
</task>

<role>
  You are a senior full stack developer specializing in React (Vite), Node.js (Express), and ethers.js.
</role>

<requirements>
  ### Business Requirements
  - Display token prices in cards: symbol, USD price, 24h change %, market cap
  - Color-coded 24h change: green for positive, red for negative
  - Auto-refresh prices every 30 seconds
  - Loading skeleton while fetching
  - Sort by 24h change descending on load

  ### Technical Requirements
  - Frontend calls backend API only
  - Backend proxies to CoinGecko API
  - TypeScript with strict mode
  - API key stored in .env
  - Responsive: 1 col mobile, 2 col md, 4 col lg
</requirements>

<endpoints>
  ### Backend - GET /api/tokens
  Response: { tokens: TokenPrice[], updatedAt: string }

  ### CoinGecko API - Simple Price (backend use only)
  URL: https://api.coingecko.com/api/v3/simple/price
  Auth: Header x-cg-demo-api-key
  Params: ids=bitcoin,ethereum,chainlink&vs_currencies=usd&include_24hr_change=true&include_market_cap=true
  Response: { bitcoin: { usd, usd_24h_change, usd_market_cap }, ... }
</endpoints>

<critical>
  Out of scope:
  - No wallet connect / Web3 provider integration
  - No inline code comments

  IMPORTANT: Frontend must never call the CoinGecko API directly.
</critical>
```

What the LLM does with this:

1. `read_file` the relevant existing files (knows the stack already)
2. Builds exactly what was described, with the architecture already decided

---

## Template for features in this repo

Use this template for any new feature prompt. Customize each section:

```xml
<task>
  [One sentence describing the feature]
</task>

<role>
  You are a senior full stack developer. [List the relevant tech from this repo once we have a CLAUDE.md]
</role>

<requirements>
  ### Business Requirements
  - [User-visible behavior]

  ### Technical Requirements
  - [Architecture constraints]
  - [Library choices]
  - [Security/env requirements]
</requirements>

<endpoints>
  [Paste API contracts for any external service. Skip if none.]
</endpoints>

<tests>
  - [How to verify the feature works]
</tests>

<critical>
  Out of scope:
  - [Explicit list of what NOT to build]

  IMPORTANT: [Most critical rule]
  IMPORTANT: [Same rule again]
</critical>
```

---

## Practical exercise

1. Pick a feature you'd want to add to this repo (or invent one).
2. Write a vague one-line prompt for it.
3. Then fill out the full template above.
4. Run both in Claude Code (`/clear` between them).
5. Compare:
  - Tool call count (watch the output in Claude Code)
  - Quality and consistency of the output
  - Whether the LLM made any unsolicited architecture decisions

The difference will be visible in the first 30 seconds of execution.