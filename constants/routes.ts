export const ROUTES = {
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    signup: "/(auth)/signup",
    profile: "/(auth)/profile",
    verifyPhone: "/(auth)/verify-phone",
    otp: "/(auth)/otp",
    resetPassword: "/(auth)/reset-password",
    checkEmail: "/(auth)/check-email",
    passwordResetSuccess: "/(auth)/password-reset-success",
    newPassword: "/(auth)/new-password",
  },
  onboarding: {
    root: "/(onboarding)",
    welcome: "/(onboarding)/welcome",
    goals: "/(onboarding)/goals",
    location: "/(onboarding)/location",
    notifications: "/(onboarding)/notifications",
    done: "/(onboarding)/done",
  },
  tabs: {
    root: "/(tabs)",
    home: "/(tabs)/home",
  },
  root: {
    index: "/",
  },
} as const;


