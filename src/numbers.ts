export const interestingNumbers = {
  pi: {
    name: "Pi",
    symbol: "π",
    formula: "π = C / d",
    value: Math.PI,
    significance:
      "The ratio of a circle's circumference to its diameter; it also appears throughout geometry, analysis, probability, and physics.",
  },
  e: {
    name: "Euler's number",
    symbol: "e",
    formula: "e = lim(n→∞) (1 + 1/n)^n",
    value: Math.E,
    significance:
      "The natural base of exponential growth and logarithms, central to calculus, probability, and compound growth.",
  },
  phi: {
    name: "Golden ratio",
    symbol: "φ",
    formula: "φ = (1 + √5) / 2",
    value: (1 + Math.sqrt(5)) / 2,
    significance:
      "The positive solution of x² = x + 1, closely connected to Fibonacci numbers, geometry, and continued fractions.",
  },
  i: {
    name: "Imaginary unit",
    symbol: "i",
    formula: "i² = -1",
    value: "√-1",
    significance:
      "Extends the real numbers to the complex plane and makes Euler's identity e^(iπ) + 1 = 0 possible.",
  },
} as const;

export type InterestingNumberId = keyof typeof interestingNumbers;

export function isInterestingNumberId(value: string): value is InterestingNumberId {
  return Object.hasOwn(interestingNumbers, value);
}
