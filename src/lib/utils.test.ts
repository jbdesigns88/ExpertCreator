import { describe, expect, it, vi } from "vitest";

import { cn, formatMinutes, safeId } from "./utils";

describe("utility helpers", () => {
  it("merges conditional class names", () => {
    expect(cn("base", false && "hidden", "mt-2", { active: true })).toBe("base mt-2 active");
  });

  it("formats minutes into human readable strings", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 hr");
    expect(formatMinutes(125)).toBe("2 hrs 5 min");
  });

  it("falls back to Math.random when crypto is unavailable", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const original = globalThis.crypto;
    // @ts-expect-error - intentionally removing crypto for the test scenario
    globalThis.crypto = undefined;

    const id = safeId("demo");
    expect(id).toMatch(/^demo-/);

    globalThis.crypto = original;
    spy.mockRestore();
  });
});
