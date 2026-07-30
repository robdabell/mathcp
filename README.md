# mathcp

A small, stateless MCP server for some of mathematics' most interesting constants,
hosted on Cloudflare Workers.

## What it exposes

- `list_interesting_numbers` lists the available constants.
- `get_interesting_number` returns a constant, its defining formula, a decimal
  approximation, and why it matters.
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
