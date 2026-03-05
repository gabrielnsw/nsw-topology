import { WEATHERMAP_THRESHOLDS } from '../constants';

// traffic value -> % of link capacity
export const getUtilizationPercent = (currentValue: number, capacity: number): number => {
  if (capacity <= 0) {
    return 0;
  }
  const percent = (currentValue / (capacity * 1e6)) * 100;
  return Math.min(Math.max(percent, 0), 200);
};

// pick color from thresholds based on utilization %
export const getUtilizationColor = (percent: number): string => {
  if (percent <= 0) {
    return WEATHERMAP_THRESHOLDS[0].color;
  }
  for (const t of WEATHERMAP_THRESHOLDS) {
    if (percent <= t.max) {
      return t.color;
    }
  }
  return WEATHERMAP_THRESHOLDS[WEATHERMAP_THRESHOLDS.length - 1].color;
};

// scale edge thickness based on utilization (up to 4x)
export const getUtilizationThickness = (percent: number, baseThickness: number): number => {
  const minMultiplier = 1;
  const maxMultiplier = 4;
  const clamped = Math.min(percent, 100);
  const multiplier = minMultiplier + ((maxMultiplier - minMultiplier) * clamped) / 100;
  return baseThickness * multiplier;
};
