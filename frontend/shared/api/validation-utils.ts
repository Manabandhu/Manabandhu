export const assertNonEmptyString = (
  value: string | null | undefined,
  errorMessage: string
): void => {
  if (!value?.trim()) {
    throw new Error(errorMessage);
  }
};

export const assertPositiveNumber = (
  value: number | null | undefined,
  errorMessage: string
): void => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(errorMessage);
  }
};

export const assertNumberInRange = (
  value: number | null | undefined,
  min: number,
  max: number,
  errorMessage: string
): void => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(errorMessage);
  }
};
