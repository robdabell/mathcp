# mathcp

A small, stateless MCP server for some of mathematics' most interesting constants,
hosted on Cloudflare Workers.

## What it exposes

- `list_interesting_numbers` lists the available constants.
- `get_interesting_number` returns a constant, its defining formula, a decimal
  approximation, and why it matters.
- The `mathcp://pi/methods` resource lists ten methods for calculating π,
  including each formula and its convergence characteristics.
- `calculate_pi` accepts a method identifier and a number of decimal digits
  (0–10,000), then returns the arbitrary-precision result and method metadata.
- `find_prime_numbers` uses MCP elicitation to ask exactly two questions (the
  minimum and maximum), then returns every prime in that inclusive range.
- `investigate_prime_patterns` calculates verified primes and successive prime
  gaps, then uses MCP sampling to ask the client's language model for a cautious
  pattern analysis. Ranges are limited to a span of 2,000 integers to keep the
  sampling request bounded. This tool requires a client that supports sampling.
- Prompt templates provide three different ways to explore a maths topic:
  - `mc_escher` uses symmetry, tessellation, recursion, and visual metaphors.
    Example: “Explain hyperbolic geometry using a repeating tiled world.”
  - `ada_lovelace` turns an idea into an algorithm with pseudocode and a traced
    example. Example: “Turn Euclid's algorithm into a small program and trace
    one example.”
  - `srinivasa_ramanujan` searches small examples for patterns before carefully
    separating conjecture from proof. Example: “Investigate patterns in the
    partition numbers for small integers.”
- `GET /` describes the service.
- `GET /health` provides a conventional health check.
- `/mcp` is the Streamable HTTP MCP endpoint.

The initial catalogue includes pi, Euler's number, the golden ratio, and the
imaginary unit. The code is deliberately data-driven so another constant can be
added in one place.

## Develop locally

```bash
npm install
npm run check
npm test
npm run dev
```

Run the same MCP server locally over `stdio`:

```bash
npm run mcp:local
```

For Codex, register the executable directly so npm does not write status text to
the MCP protocol stream:

```bash
codex mcp add mathcp-local -- \
  node \
  --import /absolute/path/to/mathcp/node_modules/tsx/dist/loader.mjs \
  /absolute/path/to/mathcp/src/stdio.ts
```

Copy the example secrets file and set a long random bearer token before starting
the local server:

```bash
cp .dev.vars.example .dev.vars
```

The local MCP endpoint is normally `http://localhost:8787/mcp`. Clients must send
the configured token in the `Authorization` header:

```text
Authorization: Bearer <your-token>
```

## Deploy to Cloudflare

Authenticate Wrangler, then deploy:

```bash
npx wrangler login
npx wrangler secret put AUTH_TOKEN
npm run deploy
```

Wrangler prints the deployed Worker URL. Append `/mcp` when configuring an MCP
client, for example `https://mathcp.<account>.workers.dev/mcp`. Configure the MCP
client to send the same bearer header. The root description and `/health` remain
public; `/mcp` requires authentication in both local and deployed environments.
