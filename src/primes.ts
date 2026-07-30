import { z } from "zod";

export const primeRangeSchema = z
  .object({
    minimum: z
      .number()
      .int()
      .min(2)
      .max(1_000_000)
      .describe("What is the smallest number to check?"),
    maximum: z
      .number()
      .int()
      .min(2)
      .max(1_000_000)
      .describe("What is the largest number to check?"),
  })
  .refine(({ minimum, maximum }) => minimum <= maximum, {
    message: "The minimum must be less than or equal to the maximum.",
    path: ["maximum"],
  });

export function primesInRange(minimum: number, maximum: number): number[] {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum > maximum) {
    return [];
  }

  const limit = Math.max(1, maximum);
  const isPrime = new Uint8Array(limit + 1);
  isPrime.fill(1, 2);

  for (let candidate = 2; candidate * candidate <= limit; candidate += 1) {
    if (isPrime[candidate] === 0) continue;
    for (let multiple = candidate * candidate; multiple <= limit; multiple += candidate) {
      isPrime[multiple] = 0;
    }
  }

  const primes: number[] = [];
  for (let value = Math.max(2, minimum); value <= maximum; value += 1) {
    if (isPrime[value] === 1) primes.push(value);
  }
  return primes;
}

export function primeGaps(primes: number[]): number[] {
  return primes.slice(1).map((prime, index) => prime - primes[index]);
}

export function buildPrimePatternPrompt(
  minimum: number,
  maximum: number,
  primes: number[],
  gaps: number[],
): string {
  return [
    "Analyse this verified prime-number dataset.",
    `Inclusive range: ${minimum} to ${maximum}`,
    `Primes: ${JSON.stringify(primes)}`,
    `Successive prime gaps: ${JSON.stringify(gaps)}`,
    "Identify one interesting pattern in the supplied evidence.",
    "State a cautious conjecture, test it against the data, and mention any counterevidence.",
    "Clearly distinguish numerical evidence from proof. Do not claim that the dataset proves the conjecture.",
  ].join("\n");
}
