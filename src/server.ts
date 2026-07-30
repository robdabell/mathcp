import {
  acceptedContent,
  inputRequired,
  inputResponse,
  McpServer,
} from "@modelcontextprotocol/server";
import { z } from "zod";

import { interestingNumbers, isInterestingNumberId } from "./numbers";
import { promptTemplates } from "./prompts";
import { calculatePi, isPiMethod, piMethods } from "./pi";
import {
  buildPrimePatternPrompt,
  primeGaps,
  primeRangeSchema,
  primesInRange,
} from "./primes";

export function createServer(): McpServer {
  const server = new McpServer({ name: "mathcp", version: "0.1.0" });

  server.registerResource(
    "pi-calculation-methods",
    "mathcp://pi/methods",
    {
      title: "Ten methods for calculating pi",
      description: "A catalogue of ten algorithms and formulae used to calculate π.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            Object.entries(piMethods).map(([id, details]) => ({ id, ...details })),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerTool(
    "calculate_pi",
    {
      title: "Calculate pi",
      description: "Calculate π using a named method from the pi-calculation-methods resource.",
      inputSchema: z.object({
        method: z.string().describe("Method identifier from mathcp://pi/methods"),
        digits: z.number().int().min(0).max(10_000).describe("Number of digits after the decimal point"),
      }),
    },
    async ({ method, digits }) => {
      const normalizedMethod = method.trim().toLowerCase().replaceAll("-", "_");
      if (!isPiMethod(normalizedMethod)) {
        return {
          isError: true,
          content: [{
            type: "text" as const,
            text: `Unknown pi method '${method}'. Choose one of: ${Object.keys(piMethods).join(", ")}.`,
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            method: normalizedMethod,
            methodName: piMethods[normalizedMethod].name,
            digits,
            value: calculatePi(normalizedMethod, digits),
          }),
        }],
      };
    },
  );

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
    "find_prime_numbers",
    {
      title: "Find prime numbers",
      description:
        "Ask the user for a minimum and maximum, then return every prime number in that inclusive range.",
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      const response = inputResponse(ctx.mcpReq.inputResponses, "prime_range");

      if (response.kind === "elicit" && response.action !== "accept") {
        return {
          content: [{
            type: "text" as const,
            text: response.action === "decline"
              ? "The user declined to provide a prime-number range."
              : "The prime-number request was cancelled.",
          }],
        };
      }

      const range = acceptedContent(
        ctx.mcpReq.inputResponses,
        "prime_range",
        primeRangeSchema,
      );

      if (!range) {
        return inputRequired({
          inputRequests: {
            prime_range: inputRequired.elicit({
              message: "Answer these two questions to choose a prime-number range.",
              requestedSchema: primeRangeSchema,
            }),
          },
        });
      }

      const primes = primesInRange(range.minimum, range.maximum);
      const output = {
        minimum: range.minimum,
        maximum: range.maximum,
        count: primes.length,
        primes,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    "investigate_prime_patterns",
    {
      title: "Investigate prime-number patterns",
      description:
        "Calculate primes and prime gaps, then ask the client's language model to identify a pattern and form a cautious conjecture.",
      inputSchema: z
        .object({
          minimum: z.number().int().min(2).max(100_000),
          maximum: z.number().int().min(2).max(100_000),
        })
        .refine(({ minimum, maximum }) => minimum <= maximum, {
          message: "The minimum must be less than or equal to the maximum.",
          path: ["maximum"],
        })
        .refine(({ minimum, maximum }) => maximum - minimum <= 2_000, {
          message: "The range may span at most 2,000 integers.",
          path: ["maximum"],
        }),
    },
    async ({ minimum, maximum }, ctx) => {
      const primes = primesInRange(minimum, maximum);
      const gaps = primeGaps(primes);
      const response = inputResponse(ctx.mcpReq.inputResponses, "prime_pattern_analysis");

      if (response.kind === "missing") {
        return inputRequired({
          inputRequests: {
            prime_pattern_analysis: inputRequired.createMessage({
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: buildPrimePatternPrompt(minimum, maximum, primes, gaps),
                  },
                },
              ],
              maxTokens: 500,
            }),
          },
        });
      }

      const analysis = response.kind === "sampling"
        ? (Array.isArray(response.result.content)
          ? response.result.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n")
          : response.result.content.type === "text"
            ? response.result.content.text
            : "The client returned no textual analysis.")
        : "The client did not return a sampling response.";

      const output = {
        minimum,
        maximum,
        count: primes.length,
        primes,
        gaps,
        analysis,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
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
