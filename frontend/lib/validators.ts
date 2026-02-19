import { z } from "zod";
import { REGEX } from '@/shared/constants/regex";

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(REGEX.phoneE164, "Invalid phone number format"),
  countryCode: z.string().min(1, "Country code is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  role: z.enum(["student", "worker", "visitor"], {
    required_error: "Please select a role",
  }),
});

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "password123",
  "admin123",
  "qwerty123",
  "welcome123",
  "letmein123",
  "monkey123",
  "dragon123",
  "master123",
];

const isCommonPassword = (password: string): boolean => {
  const lowerPassword = password.toLowerCase();
  return COMMON_PASSWORDS.some((common) => lowerPassword.includes(common));
};

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(REGEX.passwordUppercase, "Password must contain at least one uppercase letter")
      .regex(REGEX.passwordNumber, "Password must contain at least one number")
      .regex(REGEX.passwordSpecial, "Password must contain at least one special character")
      .refine((pwd) => !isCommonPassword(pwd), {
        message: "Password is too common. Please choose a more unique password.",
      })
      .refine((pwd) => {
        // Check for repeated characters (e.g., "aaaaaa" or "111111")
        return !/(.)\1{3,}/.test(pwd);
      }, {
        message: "Password contains too many repeated characters.",
      })
      .refine((pwd) => {
        // Check for sequential characters (e.g., "123456" or "abcdef")
        const sequences = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
        const lowerPwd = pwd.toLowerCase();
        return !sequences.some((seq) => {
          for (let i = 0; i <= seq.length - 4; i++) {
            const substr = seq.substring(i, i + 4);
            if (lowerPwd.includes(substr) || lowerPwd.includes(substr.split("").reverse().join(""))) {
              return true;
            }
          }
          return false;
        });
      }, {
        message: "Password contains sequential characters. Please use a more random password.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type EmailInput = z.infer<typeof emailSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type OTPInput = z.infer<typeof otpSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

