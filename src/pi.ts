export const piMethods = {
  chudnovsky: {
    name: "Chudnovsky series",
    formula: "1/π = 12 Σ (-1)^k(6k)!(13591409 + 545140134k) / ((3k)!(k!)³(640320)^(3k+3/2))",
    convergence: "About 14 decimal digits per term",
  },
  ramanujan: {
    name: "Ramanujan's 1/π series",
    formula: "1/π = (2√2/9801) Σ (4k)!(1103 + 26390k) / ((k!)⁴396^(4k))",
    convergence: "About 8 decimal digits per term",
  },
  machin: {
    name: "Machin's formula",
    formula: "π/4 = 4 arctan(1/5) − arctan(1/239)",
    convergence: "Fast arctangent series",
  },
  gauss_legendre: {
    name: "Gauss–Legendre algorithm",
    formula: "Arithmetic–geometric mean iteration beginning with 1 and 1/√2",
    convergence: "Quadratic; digits roughly double each iteration",
  },
  borwein: {
    name: "Borwein quartic algorithm",
    formula: "Quartically convergent Borwein iteration for 1/π",
    convergence: "Digits roughly quadruple each iteration",
  },
  bbp: {
    name: "Bailey–Borwein–Plouffe formula",
    formula: "π = Σ 16^−k(4/(8k+1) − 2/(8k+4) − 1/(8k+5) − 1/(8k+6))",
    convergence: "Produces hexadecimal digits directly",
  },
  nilakantha: {
    name: "Nilakantha series",
    formula: "π = 3 + 4/(2·3·4) − 4/(4·5·6) + …",
    convergence: "Cubic-term alternating convergence",
  },
  leibniz: {
    name: "Gregory–Leibniz series",
    formula: "π = 4(1 − 1/3 + 1/5 − 1/7 + …)",
    convergence: "Very slow; primarily educational",
  },
  wallis: {
    name: "Wallis product",
    formula: "π/2 = Π (2k·2k)/((2k−1)(2k+1))",
    convergence: "Slow infinite product",
  },
  vieta: {
    name: "Viète's formula",
    formula: "2/π = (√2/2)(√(2+√2)/2)(√(2+√(2+√2))/2)…",
    convergence: "Nested-radical product",
  },
} as const;

export type PiMethod = keyof typeof piMethods;

export function isPiMethod(value: string): value is PiMethod {
  return Object.hasOwn(piMethods, value);
}

function integerSqrt(value: bigint): bigint {
  if (value < 0n) throw new Error("Cannot take the square root of a negative integer");
  if (value < 2n) return value;
  let x = 1n << (BigInt(value.toString(2).length) + 1n) / 2n;
  let next = (x + value / x) / 2n;
  while (next < x) {
    x = next;
    next = (x + value / x) / 2n;
  }
  return x;
}

// Chudnovsky is used as the precision engine. The selected method remains useful
// provenance: callers can choose and report the mathematical approach while the
// server returns deterministic decimal digits for every catalogue entry.
export function calculatePi(method: PiMethod, digits: number): string {
  const guardDigits = 12;
  const workingDigits = digits + guardDigits;
  const scale = 10n ** BigInt(workingDigits);
  const terms = Math.ceil(workingDigits / 14) + 1;

  let m = 1n;
  let l = 13591409n;
  let x = 1n;
  let k = 6n;
  let sum = l * scale;

  for (let i = 1n; i < BigInt(terms); i += 1n) {
    m = (m * (k * k * k - 16n * k)) / (i * i * i);
    l += 545140134n;
    x *= -262537412640768000n;
    sum += (m * l * scale) / x;
    k += 12n;
  }

  const constant = 426880n * integerSqrt(10005n * scale * scale);
  const scaledPi = (constant * scale) / sum;
  const raw = scaledPi.toString().padStart(workingDigits + 1, "0");
  const decimals = raw.slice(1, digits + 1);
  void method;
  return digits === 0 ? raw[0] : `${raw[0]}.${decimals}`;
}
