export interface SM2Config {
  initialEase: number;
  interval1: number;
  interval2: number;
  interval3: number;
  interval4: number;
  minEase: number;
  maxInterval: number;
}

const DEFAULTS: SM2Config = {
  initialEase: 2.5,
  interval1: 1,
  interval2: 3,
  interval3: 7,
  interval4: 15,
  minEase: 1.3,
  maxInterval: 40,
};

export function getSM2Config(): SM2Config {
  return { ...DEFAULTS };
}

/** @deprecated No longer user-configurable */
export function saveSM2Config(_config: Partial<SM2Config>) {}

/** @deprecated No longer user-configurable */
export function resetSM2Config() {}

export function getSM2Defaults(): SM2Config {
  return { ...DEFAULTS };
}
