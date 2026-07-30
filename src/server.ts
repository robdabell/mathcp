import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { interestingNumbers, isInterestingNumberId } from "./numbers";
import { promptTemplates } from "./prompts";

export function createServer(): McpServer {
  const server = new McpServer({ name: "mathcp", version: "0.1.0" });

  server.registerTool(
    "list_interesting_numbers",
    {
      description: "List the mathematical constants available from MathCP.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            Object.entries(interestingNumbers).map(([id, number]) => ({
              id,
              name: number.name,
              symbol: number.symbol,
            })),
          ),
        },
      ],
    }),
  );

  server.registerTool(
    "get_interesting_number",
    {
      description:
        "Get a mathematical constant, its formula, decimal value, and significance.",
      inputSchema: z.object({
        id: z
          .string()
          .describe("Constant identifier: pi, e, phi, or i"),
        precision: z
          .number()
          .int()
          .min(1)
          .max(15)
          .default(10)
          .describe("Significant digits for real-valued constants"),
      }),
    },
    async ({ id, precision }) => {
      const normalizedId = id.trim().toLowerCase();
      if (!isInterestingNumberId(normalizedId)) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Unknown constant '${id}'. Choose one of: ${Object.keys(interestingNumbers).join(", ")}.`,
            },
          ],
        };
      }

      const number = interestingNumbers[normalizedId];
      const value =
        typeof number.value === "number"
          ? number.value.toPrecision(precision)
          : number.value;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              id: normalizedId,
              name: number.name,
              symbol: number.symbol,
              formula: number.formula,
              value,
              significance: number.significance,
            }),
          },
        ],
      };
    },
  );

  for (const [id, template] of Object.entries(promptTemplates)) {
    server.registerPrompt(
      id,
      {
        title: template.title,
        description: `${template.description} Example: ${template.sampleTopic}`,
        argsSchema: z.object({
          topic: z.string().min(1).describe("The mathematical topic or problem to explore"),
          audience: z
            .string()
            .min(1)
            .default("a curious general reader")
            .describe("Who the explanation is for"),
        }),
      },
      ({ topic, audience }) => ({
        description: template.description,
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: template.build(topic, audience),
            },
          },
        ],
      }),
    );
  }

  return server;
}
