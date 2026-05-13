# 01 — LLM Fundamentals for Developers

Understanding how LLMs work under the hood is not optional. Every bad prompt, every token explosion, every hallucination has a mechanical explanation in here.

---

## The stateless nature of LLMs

An LLM has no memory between requests. Every time you send a message, the entire conversation history is serialized and sent as input tokens. The model reads it all from scratch, generates a response, and discards its state.

What this means in practice:

- The "session" you see in Claude Code or Cursor is an illusion maintained by the client. The LLM sees a flat list of messages.
- Longer conversations cost more on every single request, not just the new messages.
- Changing topics mid-session doesn't save you anything — the old topic is still in the context.
- Every tool call result gets appended to that same flat list.

This is easy to observe with a raw TypeScript client against OpenRouter. Sending "hello" produces a simple response. Sending "hello" after ten back-and-forth exchanges costs ~10x more input tokens for the exact same question.

---

## How tool calls actually work

When you give an LLM access to tools (file read, bash, web search), the process is:

1. You send the message + the full tool schema definitions.
2. The LLM returns a `tool_call` JSON object — it does not execute anything. It just says "I want to call `read_file` with `path = /foo/bar.ts`".
3. Your code (the agent harness — Claude Code, Cursor, etc.) receives that, executes `read_file` locally, and appends the result to the message history.
4. The updated history (including the tool result) is sent back to the LLM.
5. The LLM reads the result and generates the next response (or makes another tool call).

The LLM is always stateless. It never directly accesses your filesystem, network, or anything else. The host application does.

### Why this matters for token cost

Every tool call is a round trip:
- Input tokens: full history + tool schemas + your message + previous tool results
- Output tokens: the tool_call JSON (or the final text response)

A vague prompt triggers extra tool calls. For example:

**Vague**: "Fix the bug in the auth module"
→ LLM calls `list_dir("/")` → sees project structure → calls `list_dir("src/")` → eventually calls `read_file("src/auth/index.ts")` → then fixes it.

**Precise**: "Fix the null pointer in `src/auth/index.ts` at line 42"
→ LLM calls `read_file("src/auth/index.ts")` → fixes it.

The first version uses 2-3 extra tool calls. Going from a precise to a vague prompt doubles the context log — a real comparison showed 573 vs 1080 lines for the same task.

---

## Token cost is multiplicative, not additive

Every tool call appends to the history. By the time you're on the 5th tool call in a session, the LLM is processing:

```
user message
+ all tool schemas (repeated every request)
+ tool call 1 + result 1
+ tool call 2 + result 2
+ tool call 3 + result 3
+ tool call 4 + result 4
+ tool call 5 (current)
```

The input token count grows with every step. If you're spending a session fixing 20 small things sequentially in one context window, the later fixes are paying for all the earlier ones.

---

## Context window and hallucinations

Every model has a context window — the maximum number of tokens it can hold in a single request. Common sizes:

- Claude Sonnet: ~200k tokens
- Claude Opus: ~200k tokens
- Some models: up to 2M tokens

Bigger window ≠ better performance. LLMs are transformer-based neural networks running on floating-point arithmetic. The more data in the context, the more accumulated rounding error in the attention mechanism. At high context usage, the model loses coherence — it starts "hallucinating" because the signal of early context gets diluted by the noise of a massive token sequence.

**Rule of thumb: stay below 60% context usage.** At 60%+, start a fresh session and pass the relevant artifacts by reference instead of carrying them in context.

In Claude Code: use `/status` to see your current context usage.

### What happens when you hit the limit

The agent triggers context compaction — it summarizes the history to free space. This is worse than starting fresh: you lose precision and the summary may drop important details. You're paying for a degraded output.

---

## MCPs: umbrella of tools

Model Context Protocol (MCP) is an Anthropic-created standard for packaging tools. When you enable an MCP (e.g., Supabase, GitHub, Playwright), it loads all of that MCP's tool schemas into every request.

The problem: you pay for all those tool schemas in input tokens on every request, even if you never use most of them.

Example: enabling the GitHub MCP adds ~30-50 tool definitions to every prompt. If you're doing frontend work, you're wasting those tokens on every message.

**Best practice**: disable MCPs you don't need for the current task. In Claude Code: `/mcp` to manage them.

MCPs are powerful but expensive — enable only what you need for the current phase.

---

## Practical exercises

### Exercise 1: Observe token usage
1. Open Claude Code in this repo.
2. Run `/status` — note the context usage %.
3. Ask a vague question about the codebase (e.g., "what does this project do?").
4. Run `/status` again. Note the increase.
5. Clear context with `/clear`.
6. Ask a precise question that points directly at a file (e.g., "What does `openspec/config.yaml` configure?").
7. Run `/status` again and compare.

### Exercise 2: Vague vs. precise prompt tool call count
1. In Claude Code, enable verbose mode or use the context log feature.
2. Ask: "fix any issues in the project config".
3. Count how many tool calls are made before the final response.
4. Clear, then ask: "Review `openspec/config.yaml` — is the schema field set correctly for SDD use?".
5. Count tool calls again.
6. The difference is your token waste from imprecision.
