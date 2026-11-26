# mathcp

[![Docker image](https://github.com/robdabell/mathcp/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/robdabell/mathcp/pkgs/container/mathcp)
[![CI](https://github.com/robdabell/mathcp/actions/workflows/ci.yml/badge.svg)](https://github.com/robdabell/mathcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![mathcp MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/robdabell/mathcp/badges/score.svg)](https://glama.ai/mcp/servers/robdabell/mathcp)

[![mathcp MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/robdabell/mathcp/badges/card.svg)](https://glama.ai/mcp/servers/robdabell/mathcp)

**Give your AI assistant a maths toolkit it can trust.** mathcp is an
[MCP](https://modelcontextprotocol.io) server that computes π to as many as
10,000 exact decimal places with any of ten classic algorithms, finds and
analyses prime numbers, and explains famous constants such as e, φ and i.
Language models are bad at long arithmetic, so mathcp does the exact work and
lets the model do the explaining.

- **Exact π, ten ways.** Chudnovsky, Ramanujan, Machin, Gauss–Legendre, Borwein,
  BBP, Nilakantha, Leibniz, Wallis and Viète, with arbitrary-precision results
  and notes on how fast each converges.
- **Primes and their patterns.** Every prime in a range, plus successive prime
  gaps that the client's model analyses, keeping observation separate from
  conjecture.
- **Constants with context.** The formula, value and significance of π, e, the
  golden ratio and the imaginary unit.
- **Three ways to learn.** Prompt templates in the styles of M. C. Escher (visual),
  Ada Lovelace (algorithmic) and Srinivasa Ramanujan (pattern hunting).

It runs locally over `stdio` with no API keys (Docker or Node.js), or remotely on
Cloudflare Workers. It also demonstrates newer MCP features: resources, prompts,
elicitation and sampling.

## Quick start

### Docker (recommended)

No setup beyond Docker. Add this to your MCP client's configuration, for example
`claude_desktop_config.json` for Claude Desktop or `.cursor/mcp.json` for Cursor:

```json
{
  "mcpServers": {
    "mathcp": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ghcr.io/robdabell/mathcp:latest"]
    }
  }
}
```

For Claude Code:

```bash
claude mcp add mathcp -- docker run -i --rm ghcr.io/robdabell/mathcp:latest
```

To build the image yourself instead: `docker build -t mathcp .` and use `mathcp`
in place of the image name above.

### Node.js

Requires Node.js 22 or later.

```bash
git clone https://github.com/robdabell/mathcp.git
cd mathcp
npm install
npm run build:stdio
```

Then point your client at the bundled server:

```json
{
  "mcpServers": {
    "mathcp": {
      "command": "node",
      "args": ["/absolute/path/to/mathcp/dist/stdio.js"]
    }
  }
}
```

The local `stdio` server needs no API keys or bearer token.

### Things to try

- “What is the golden ratio and why does it matter?”
- “Calculate π to 500 digits using the Chudnovsky method, then with Machin's formula, and check they agree.”
- “Find all the primes between 1,000 and 1,100.” (uses elicitation)
- “Investigate prime gaps between 10,000 and 12,000.” (uses sampling)
- Use the `ada_lovelace` prompt with the topic “Euclid's algorithm”.

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

The remote Cloudflare Worker version requires a bearer token; the local
`stdio` server above does not.

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

## Licence

[MIT](LICENSE)
