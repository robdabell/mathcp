import { describe, expect, it } from "vitest";

import { calculatePi, isPiMethod, piMethods } from "../src/pi";

describe("pi methods", () => {
  it("catalogues exactly ten methods", () => {
    expect(Object.keys(piMethods)).toHaveLength(10);
  });

  it("validates method identifiers", () => {
    expect(isPiMethod("chudnovsky")).toBe(true);
    expect(isPiMethod("guessing")).toBe(false);
  });

  it("calculates the requested number of decimal digits", () => {
    expect(calculatePi("machin", 0)).toBe("3");
    expect(calculatePi("chudnovsky", 50)).toBe(
      "3.14159265358979323846264338327950288419716939937510",
    );
  });
});
