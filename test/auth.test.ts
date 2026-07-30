import { describe, expect, it } from "vitest";

import { authorizeRequest } from "../src/auth";

const url = "http://localhost:8787/mcp";

describe("MCP bearer authentication", () => {
  it("accepts the configured bearer token", async () => {
    const request = new Request(url, {
      headers: { Authorization: "Bearer local-secret" },
    });

    expect(await authorizeRequest(request, { AUTH_TOKEN: "local-secret" })).toBeNull();
  });

  it("rejects a missing or invalid bearer token", async () => {
    const missing = await authorizeRequest(new Request(url), {
      AUTH_TOKEN: "local-secret",
    });
    const invalid = await authorizeRequest(
      new Request(url, { headers: { Authorization: "Bearer wrong" } }),
      { AUTH_TOKEN: "local-secret" },
    );

    expect(missing?.status).toBe(401);
    expect(invalid?.status).toBe(401);
    expect(missing?.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("fails closed when no token is configured", async () => {
    const response = await authorizeRequest(new Request(url), {});

    expect(response?.status).toBe(503);
  });
});
