import { describe, expect, it } from "vitest";

import { interestingNumbers, isInterestingNumberId } from "../src/numbers";
import { promptTemplates } from "../src/prompts";

describe("interesting number catalogue", () => {
  it("contains accurate real-valued constants", () => {
    expect(interestingNumbers.pi.value).toBeCloseTo(Math.PI, 14);
    expect(interestingNumbers.e.value).toBeCloseTo(Math.E, 14);
    expect(interestingNumbers.phi.value).toBeCloseTo(1.618033988749895, 14);
  });

  it("validates identifiers", () => {
    expect(isInterestingNumberId("pi")).toBe(true);
    expect(isInterestingNumberId("tau")).toBe(false);
  });
});

describe("prompt template catalogue", () => {
  it("contains the three documented mathematical voices", () => {
    expect(Object.keys(promptTemplates)).toEqual([
      "mc_escher",
      "ada_lovelace",
      "srinivasa_ramanujan",
    ]);
  });

  it("uses the supplied topic and audience", () => {
    const prompt = promptTemplates.mc_escher.build("symmetry groups", "year 10 students");

    expect(prompt).toContain("symmetry groups");
    expect(prompt).toContain("year 10 students");
  });
});
