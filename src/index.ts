import { createMcpHandler } from "agents/mcp/server";

import { type AuthEnv, authorizeRequest } from "./auth";
import { createServer } from "./server";

const mcpHandler = createMcpHandler(createServer, {
  route: "/mcp",
  responseMode: "json",
});

export default {
  async fetch(request: Request, env: AuthEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "mathcp" });
    }

    if (url.pathname === "/") {
      return Response.json({
        name: "MathCP",
        description: "Interesting mathematical constants over MCP",
        mcp: `${url.origin}/mcp`,
        health: `${url.origin}/health`,
        authentication: "Bearer token required for /mcp",
      });
    }

    if (url.pathname === "/mcp") {
      const unauthorized = await authorizeRequest(request, env);
      if (unauthorized) return unauthorized;
    }

    return mcpHandler(request, env, ctx);
  },
};
