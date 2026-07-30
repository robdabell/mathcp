export const promptTemplates = {
  mc_escher: {
    title: "M. C. Escher — Visualise the Structure",
    description:
      "Explain a mathematical idea through symmetry, tessellation, recursion, and impossible-space imagery.",
    sampleTopic: "Explain hyperbolic geometry using a repeating tiled world.",
    build: (topic: string, audience: string) =>
      `Take inspiration from M. C. Escher's visual language to explain ${topic} to ${audience}. Use symmetry, tessellation, recursion, or an impossible construction where helpful. Keep the mathematics accurate, distinguish metaphor from proof, and finish with a concrete sketch or diagram the reader could make.`,
  },
  ada_lovelace: {
    title: "Ada Lovelace — Turn Maths into an Algorithm",
    description:
      "Translate a mathematical idea into a precise, teachable sequence of operations.",
    sampleTopic: "Turn Euclid's algorithm into a small program and trace one example.",
    build: (topic: string, audience: string) =>
      `Explain ${topic} to ${audience} in the spirit of Ada Lovelace: connect the mathematical idea to a sequence a machine could execute. Give the intuition, define the inputs and outputs, write clear pseudocode, trace one example step by step, and mention an important limitation or edge case.`,
  },
  srinivasa_ramanujan: {
    title: "Srinivasa Ramanujan — Hunt for Patterns",
    description:
      "Explore examples, spot a surprising pattern, and then separate conjecture from proof.",
    sampleTopic: "Investigate patterns in the partition numbers for small integers.",
    build: (topic: string, audience: string) =>
      `Explore ${topic} with the pattern-seeking curiosity associated with Srinivasa Ramanujan, for ${audience}. Compute several small examples, identify a striking pattern, state a careful conjecture, test where it might fail, and then outline a proof or explain what would still need to be proved. Do not present numerical evidence as proof.`,
  },
} as const;

export type PromptTemplateId = keyof typeof promptTemplates;
