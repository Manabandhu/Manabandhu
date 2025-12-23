/**
 * Timing constants used throughout the application
 */

export const TIMING = {
  // Splash screen delays
  SPLASH_HIDE_DELAY: 500, // milliseconds

  // OTP/Verification timers
  OTP_RESEND_COOLDOWN: 58, // seconds
  OTP_RESEND_COOLDOWN_EMAIL: 60, // seconds
  OTP_SUCCESS_REDIRECT_DELAY: 2000, // milliseconds

  // Password reset email expiry
  PASSWORD_RESET_EXPIRY_MINUTES: 15,

  // Animation durations
  ANIMATION_SHORT: 200,
  ANIMATION_MEDIUM: 300,
  ANIMATION_LONG: 500,

  // Debounce delays
  SEARCH_DEBOUNCE: 300, // milliseconds
  INPUT_DEBOUNCE: 500, // milliseconds
} as const;

