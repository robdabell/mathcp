import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { createServer } from "./server";

serveStdio(createServer, {
  onerror(error) {
    console.error("MathCP stdio error:", error);
  },
});
