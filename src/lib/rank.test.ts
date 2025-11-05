import { describe, expect, it } from "vitest";

import {
  BELTS,
  DEFAULT_RANK_CONFIG,
  applyTestResult,
  computeProgress,
  formatBelt,
  initialRankState,
  type RankConfig,
  type RankState
} from "./rank";

describe("rank progression", () => {
  it("awards pass points and carries over remainder towards stripes", () => {
    const start = initialRankState();
    const first = applyTestResult(start, DEFAULT_RANK_CONFIG, 95);
    expect(first.awardedPoints).toBe(DEFAULT_RANK_CONFIG.passPoints);
    expect(first.state.points).toBe(DEFAULT_RANK_CONFIG.passPoints);
    expect(first.state.stripes).toBe(0);
    expect(first.leveledUp).toBe(false);

    const second = applyTestResult(first.state, DEFAULT_RANK_CONFIG, 92);
    expect(second.state.stripes).toBe(1);
    expect(second.state.points).toBe(1);
    expect(second.leveledUp).toBe(false);
  });

  it("levels up the belt once enough stripes are earned", () => {
    const nearPromotion: RankState = {
      beltIndex: 0,
      stripes: DEFAULT_RANK_CONFIG.stripesPerBelt - 1,
      points: DEFAULT_RANK_CONFIG.pointsPerStripe - 1
    };

    const result = applyTestResult(nearPromotion, DEFAULT_RANK_CONFIG, 98);

    expect(result.leveledUp).toBe(true);
    expect(result.state.beltIndex).toBe(1);
    expect(result.state.stripes).toBe(0);
    expect(result.state.points).toBe(1);
    expect(formatBelt(result.state)).toBe(BELTS[1]);
  });

  it("caps stripes once the final belt is achieved", () => {
    const finalConfig: RankConfig = { ...DEFAULT_RANK_CONFIG, stripesPerBelt: 4 };
    const nearEnd: RankState = {
      beltIndex: BELTS.length - 1,
      stripes: finalConfig.stripesPerBelt,
      points: finalConfig.pointsPerStripe - 1
    };

    const result = applyTestResult(nearEnd, finalConfig, 85);

    expect(result.state.beltIndex).toBe(BELTS.length - 1);
    expect(result.state.stripes).toBe(finalConfig.stripesPerBelt);
    expect(result.state.points).toBe(0);
  });

  it("computes progress as a bounded percentage", () => {
    const config: RankConfig = { ...DEFAULT_RANK_CONFIG };

    expect(computeProgress(initialRankState(), config)).toBe(0);

    const midState: RankState = {
      beltIndex: 2,
      stripes: 1,
      points: 2
    };

    const progress = computeProgress(midState, config);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);

    const maxed: RankState = {
      beltIndex: BELTS.length - 1,
      stripes: config.stripesPerBelt,
      points: config.pointsPerStripe
    };

    expect(computeProgress(maxed, config)).toBe(100);
  });
});
