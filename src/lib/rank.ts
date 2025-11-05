export type Belt = "White" | "Blue" | "Purple" | "Brown" | "Black" | "Coral";

export interface RankState {
  beltIndex: number;
  stripes: number;
  points: number;
}

export const BELTS: Belt[] = ["White", "Blue", "Purple", "Brown", "Black", "Coral"];

export interface RankConfig {
  pointsPerStripe: number;
  stripesPerBelt: number;
  passPoints: number;
  failPoints: number;
  passScore: number;
}

export const DEFAULT_RANK_CONFIG: RankConfig = {
  pointsPerStripe: 3,
  stripesPerBelt: 4,
  passPoints: 2,
  failPoints: 1,
  passScore: 90
};

export function initialRankState(): RankState {
  return {
    beltIndex: 0,
    stripes: 0,
    points: 0
  };
}

export function applyTestResult(
  state: RankState,
  config: RankConfig,
  score: number
): { state: RankState; awardedPoints: number; leveledUp: boolean } {
  const next = { ...state };
  const awardedPoints = score >= config.passScore ? config.passPoints : config.failPoints;
  next.points += awardedPoints;

  let leveledUp = false;
  while (next.points >= config.pointsPerStripe) {
    next.points -= config.pointsPerStripe;
    next.stripes += 1;
    if (next.stripes >= config.stripesPerBelt) {
      if (next.beltIndex < BELTS.length - 1) {
        next.beltIndex += 1;
        next.stripes = 0;
        leveledUp = true;
      } else {
        next.stripes = config.stripesPerBelt;
        next.points = 0;
        break;
      }
    }
  }

  if (next.beltIndex === BELTS.length - 1) {
    next.stripes = Math.min(next.stripes, config.stripesPerBelt);
  }

  return { state: next, awardedPoints, leveledUp };
}

export function computeProgress(state: RankState, config: RankConfig) {
  const totalBelts = BELTS.length;
  const perBelt = config.stripesPerBelt * config.pointsPerStripe;
  const totalNeeded = perBelt * (totalBelts - 1);
  const currentProgress = state.beltIndex * perBelt + state.stripes * config.pointsPerStripe + state.points;
  return Math.min(100, Math.round((currentProgress / totalNeeded) * 100));
}

export function formatBelt(state: RankState) {
  return BELTS[Math.min(state.beltIndex, BELTS.length - 1)];
}
