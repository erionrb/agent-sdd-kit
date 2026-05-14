# Example — Discovery Prompt (Filled In)

This is a filled-in instance of the Phase 01 Discovery skeleton.
**Scenario**: discovering how Stripe webhooks work before planning an integration.

---

```xml
<prompt>
  <role>
    You are a senior technical researcher. Your job is to produce a structured discovery document, not to implement anything.
  </role>

  <task>
    Research Stripe webhook event handling and produce a discovery document at docs/discovery/stripe-webhooks.md.
  </task>

  <file_allowlist>
    read:
      - https://stripe.com/docs/webhooks
      - https://stripe.com/docs/webhooks/signatures
      - https://stripe.com/docs/api/events/types
    write:
      - docs/discovery/stripe-webhooks.md
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - openspec/
  </file_allowlist>

  <output_format>
    Write a Markdown file with these sections:
    - ## Overview — 3–5 sentences on what this is and why it matters
    - ## Key Concepts — bullet list of terms/concepts with one-line definitions
    - ## Integration Points — what this connects to in our system
    - ## Constraints & Gotchas — limits, rate limits, quirks, deprecated APIs
    - ## Unknowns — explicitly list everything that needs human clarification, marked UNKNOWN
    - ## Sources — list every source read
  </output_format>

  <output_policy>
    - Max 300 lines for the discovery document.
    - Do not print full source files; summarize only.
    - Do not scan directories not listed above.
    - Do not implement any code.
    - Do not create files other than docs/discovery/stripe-webhooks.md.
    - Mark any information you are uncertain about as UNKNOWN.
  </output_policy>

  <budget_policy>
    This is a discovery session. Use the cheapest model that can read and summarize.
    Do not perform open-ended web searches beyond the listed sources.
  </budget_policy>
</prompt>
```

---

## Expected output structure

```markdown
# Discovery — Stripe Webhooks

## Overview
Stripe webhooks are HTTP POST requests sent by Stripe to a registered endpoint...

## Key Concepts
- **Event**: a JSON payload describing something that happened in Stripe (e.g. `payment_intent.succeeded`)
- **Endpoint secret**: a signing secret used to verify the webhook signature
- **Idempotency**: webhook events may be delivered more than once; handlers must be idempotent

## Integration Points
- Our payment service at `src/payments/` receives and processes events
- UNKNOWN: which event types we need to handle (depends on product decisions)

## Constraints & Gotchas
- Stripe retries failed webhooks for up to 3 days with exponential backoff
- Response must be 200 within 30 seconds or Stripe marks the delivery as failed
- Signature verification must happen before any business logic

## Unknowns
- UNKNOWN: Do we need to handle `invoice.payment_failed` or only `payment_intent.*` events?
- UNKNOWN: Is there a test Stripe account set up in the dev environment?

## Sources
- https://stripe.com/docs/webhooks
- https://stripe.com/docs/webhooks/signatures
```

---

## Notes

- Model used: Gemini Flash (free tier) or similar
- Estimated tokens: ~500 input, ~800 output
- Next step: resolve the UNKNOWNs, then run Phase 02 — Local Documentation
