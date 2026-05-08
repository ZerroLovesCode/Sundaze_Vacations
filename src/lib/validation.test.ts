import { describe, it, expect } from "vitest";
import { GenerateRequestSchema } from "@/lib/validation";

describe("GenerateRequestSchema", () => {
  it("accepts a valid minimal request", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "Tokyo",
      vibe: "Foodie",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budget).toBe(2500); // default
      expect(result.data.days).toBe(3);      // default
    }
  });

  it("accepts a fully specified valid request", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "Barcelona",
      vibe: "Cultural",
      budget: 3000,
      days: 5,
      wheelchairAccessible: true,
      prompt: "Add a flamenco show",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty destination", () => {
    const result = GenerateRequestSchema.safeParse({ destination: "", vibe: "Chill" });
    expect(result.success).toBe(false);
  });

  it("rejects destination over 100 characters", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "A".repeat(101),
      vibe: "Chill",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a budget below the minimum", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "Paris",
      vibe: "Romantic",
      budget: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a budget above the maximum", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "Paris",
      vibe: "Romantic",
      budget: 999999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a prompt over 500 characters (potential injection)", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "Paris",
      vibe: "Romantic",
      prompt: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects days outside the 1-14 range", () => {
    const tooLow = GenerateRequestSchema.safeParse({ destination: "Rome", vibe: "Art", days: 0 });
    const tooHigh = GenerateRequestSchema.safeParse({ destination: "Rome", vibe: "Art", days: 15 });
    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it("trims whitespace from destination and vibe", () => {
    const result = GenerateRequestSchema.safeParse({
      destination: "  Kyoto  ",
      vibe: "  Zen  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.destination).toBe("Kyoto");
      expect(result.data.vibe).toBe("Zen");
    }
  });
});
