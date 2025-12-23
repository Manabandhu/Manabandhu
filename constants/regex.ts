export const REGEX = {
  phoneE164: /^\+?[1-9]\d{1,14}$/,
  passwordUppercase: /[A-Z]/,
  passwordNumber: /[0-9]/,
  passwordSpecial: /[^A-Za-z0-9]/,
} as const;



