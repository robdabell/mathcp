import { describe, expect, it } from "vitest";

import {
  buildPrimePatternPrompt,
  primeGaps,
  primeRangeSchema,
  primesInRange,
} from "../src/primes";

describe("prime number range", () => {
  it("finds primes within an inclusive range", () => {
    expect(primesInRange(10, 30)).toEqual([11, 13, 17, 19, 23, 29]);
  });

  it("includes prime endpoints", () => {
    expect(primesInRange(2, 7)).toEqual([2, 3, 5, 7]);
  });

  it("rejects a reversed elicited range", () => {
    expect(primeRangeSchema.safeParse({ minimum: 20, maximum: 10 }).success).toBe(false);
  });

  it("defines exactly two required elicitation questions", () => {
    expect(Object.keys(primeRangeSchema.shape)).toEqual(["minimum", "maximum"]);
    expect(primeRangeSchema.safeParse({ minimum: 2 }).success).toBe(false);
    expect(primeRangeSchema.safeParse({ maximum: 10 }).success).toBe(false);
  });

  it("calculates successive prime gaps", () => {
    expect(primeGaps([11, 13, 17, 19, 23, 29])).toEqual([2, 4, 2, 4, 6]);
    expect(primeGaps([])).toEqual([]);
  });

  it("builds a sampling prompt that separates evidence from proof", () => {
    const prompt = buildPrimePatternPrompt(10, 20, [11, 13, 17, 19], [2, 4, 2]);

    expect(prompt).toContain("Inclusive range: 10 to 20");
    expect(prompt).toContain("Primes: [11,13,17,19]");
    expect(prompt).toContain("Successive prime gaps: [2,4,2]");
    expect(prompt).toContain("distinguish numerical evidence from proof");
  });
});
