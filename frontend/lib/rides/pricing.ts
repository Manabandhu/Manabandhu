import { PricingMode } from "@/types";

const MIN_PER_MILE = 0.1;
const MAX_PER_MILE = 4.0;

export const validatePerMile = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return "Price per mile is required.";
  }
  if (value < MIN_PER_MILE || value > MAX_PER_MILE) {
    return `Price per mile must be between $${MIN_PER_MILE.toFixed(2)} and $${MAX_PER_MILE.toFixed(2)}.`;
  }
  return null;
};

export const computePriceTotal = (mode: PricingMode, distanceMiles: number, priceFixed?: number, pricePerMile?: number) => {
  if (mode === "FIXED") {
    return priceFixed ?? 0;
  }
  return Math.round((distanceMiles * (pricePerMile ?? 0)) * 100) / 100;
};
