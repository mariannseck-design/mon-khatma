export interface SM2Config {
  initialEase: number;
  interval1: number;
  interval2: number;
  interval3: number;
  interval4: number;
  minEase: number;
}

const DEFAULTS: SM2Config = {
  initialEase: 2.5,
  interval1: 1,
  interval2: 3,
  interval3: 7,
  interval4: 14,
  minEase: 1.3,
};

const KEYS = {
  initialEase: 'sm2_initial_ease',
  interval1: 'sm2_interval_1',
  interval2: 'sm2_interval_2',
  interval3: 'sm2_interval_3',
  interval4: 'sm2_interval_4',
};

export function getSM2Config(): SM2Config {
  try {
    const ie = localStorage.getItem(KEYS.initialEase);
    const i1 = localStorage.getItem(KEYS.interval1);
    const i2 = localStorage.getItem(KEYS.interval2);
    const i3 = localStorage.getItem(KEYS.interval3);
    const i4 = localStorage.getItem(KEYS.interval4);
    return {
      initialEase: ie ? parseFloat(ie) : DEFAULTS.initialEase,
      interval1: i1 ? parseInt(i1, 10) : DEFAULTS.interval1,
      interval2: i2 ? parseInt(i2, 10) : DEFAULTS.interval2,
      interval3: i3 ? parseInt(i3, 10) : DEFAULTS.interval3,
      interval4: i4 ? parseInt(i4, 10) : DEFAULTS.interval4,
      minEase: DEFAULTS.minEase,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSM2Config(config: Partial<SM2Config>) {
  if (config.initialEase !== undefined) localStorage.setItem(KEYS.initialEase, config.initialEase.toString());
  if (config.interval1 !== undefined) localStorage.setItem(KEYS.interval1, config.interval1.toString());
  if (config.interval2 !== undefined) localStorage.setItem(KEYS.interval2, config.interval2.toString());
  if (config.interval3 !== undefined) localStorage.setItem(KEYS.interval3, config.interval3.toString());
  if (config.interval4 !== undefined) localStorage.setItem(KEYS.interval4, config.interval4.toString());
}

export function resetSM2Config() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function getSM2Defaults(): SM2Config {
  return { ...DEFAULTS };
}
