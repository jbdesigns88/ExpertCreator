import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generatePlan, serializePlan, deserializePlan } from "./plan";

const frozenDate = new Date("2024-01-02T15:30:00.000Z");

describe("plan generation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(frozenDate);
  });

  it("creates a balanced multi-week plan for the selected topics", () => {
    const plan = generatePlan({
      selectedTopics: ["oauth", "rag", "node"],
      weeks: 4,
      hoursPerWeek: 9,
      pace: "balanced"
    });

    expect(plan.id.startsWith("plan-")).toBe(true);
    expect(plan.createdAt).toBe(frozenDate.toISOString());
    expect(plan.title).toBe("ExpertMaker Plan — Jan 2, 2024");
    expect(plan.topics).toEqual(["oauth", "rag", "node"]);
    expect(plan.weeks).toBe(4);
    expect(plan.hoursPerWeek).toBe(9);
    expect(plan.completedSessionIds).toEqual([]);
    expect(plan.personalNote).toBe("");
    expect(plan.autoCompleteOnPass).toBe(true);
    expect(plan.pace).toBe("balanced");

    expect(plan.weeksData).toHaveLength(4);

    for (const [index, week] of plan.weeksData.entries()) {
      expect(week.id.startsWith("week-")).toBe(true);
      expect(week.weekNumber).toBe(index + 1);
      expect(week.theme).toContain(`Week ${index + 1}`);
      expect(week.summary).toContain("Balance new concepts");
      expect(week.sessions).toHaveLength(3);

      for (const session of week.sessions) {
        expect(session.id.startsWith("session-")).toBe(true);
        expect(["oauth", "rag", "node"]).toContain(session.topicId);
        expect(session.summary).toContain("deliberate drills");
        expect(session.durationMinutes).toBeGreaterThanOrEqual(60);
        expect(session.durationMinutes).toBeLessThanOrEqual(90);
        expect(session.quiz.length).toBeGreaterThan(0);
        expect(session.quiz.length).toBeLessThanOrEqual(4);
        for (const question of session.quiz) {
          expect(question.id).toBeTruthy();
          expect(question.options.length).toBeGreaterThan(0);
          expect(question.docLink).toMatch(/^https?:/);
        }
      }
    }
  });

  it("serialises and deserialises plans without losing defaults", () => {
    const plan = generatePlan({
      selectedTopics: ["system"],
      weeks: 1,
      hoursPerWeek: 6,
      pace: "intensive"
    });

    const json = serializePlan(plan);
    const restored = deserializePlan(json);

    expect(restored).toEqual(plan);
  });

  it("hydrates missing optional fields when deserialising", () => {
    const base = {
      id: "plan-test",
      title: "Custom Plan",
      createdAt: frozenDate.toISOString(),
      topics: ["typescript"],
      weeks: 2,
      hoursPerWeek: 5,
      weeksData: [],
      completedSessionIds: undefined,
      pace: undefined,
      personalNote: 42,
      autoCompleteOnPass: undefined
    } as unknown as Parameters<typeof deserializePlan>[0];

    const restored = deserializePlan(JSON.stringify(base));

    expect(restored.completedSessionIds).toEqual([]);
    expect(restored.pace).toBe("balanced");
    expect(restored.personalNote).toBe("");
    expect(restored.autoCompleteOnPass).toBe(true);
  });
});

afterEach(() => {
  vi.useRealTimers();
});
