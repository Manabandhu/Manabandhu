/**
 * Custom error types for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string, userMessage?: string) {
    super(message, code, 401, userMessage);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string, userMessage?: string) {
    super(message, code, 400, userMessage);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code: string = "NETWORK_ERROR", userMessage?: string) {
    super(message, code, 503, userMessage || "Network error. Please check your connection.");
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FirebaseError extends AppError {
  constructor(
    message: string,
    code: string,
    public originalError?: unknown,
    userMessage?: string
  ) {
    super(message, code, 500, userMessage);
    this.name = "FirebaseError";
    Object.setPrototypeOf(this, FirebaseError.prototype);
  }
}

/**
 * Maps Firebase error codes to user-friendly messages
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null) {
    return "An unexpected error occurred. Please try again.";
  }

  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || "";

  const errorMap: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password is too weak. Please choose a stronger password.",
    "auth/operation-not-allowed": "This operation is not allowed. Please contact support.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection and try again.",
    "auth/invalid-verification-code": "Invalid verification code. Please try again.",
    "auth/invalid-verification-id": "Verification session expired. Please request a new code.",
    "auth/code-expired": "Verification code has expired. Please request a new one.",
    "auth/credential-already-in-use": "This account is already linked to another user.",
    "auth/invalid-credential": "Invalid credentials. Please try again.",
    "auth/requires-recent-login": "For security reasons, please sign in again.",
  };

  return errorMap[code] || firebaseError.message || "An unexpected error occurred. Please try again.";
};

/**
 * Checks if an error is a Firebase error
 */
export const isFirebaseError = (error: unknown): error is { code: string; message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("auth/")
  );
};

/**
 * Converts any error to an AppError
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (isFirebaseError(error)) {
    return new FirebaseError(
      error.message,
      error.code,
      error,
      getFirebaseErrorMessage(error)
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR", 500);
  }

  return new AppError(
    "An unexpected error occurred",
    "UNKNOWN_ERROR",
    500,
    "An unexpected error occurred. Please try again."
  );
};

