/**
 * Input sanitization utilities
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }

  // Remove null bytes and control characters except newlines and tabs
  return input
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
};

/**
 * Sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email)
    .toLowerCase()
    .replace(/\s+/g, "")
    .slice(0, 254); // Max email length
};

/**
 * Sanitizes phone number input
 */
export const sanitizePhone = (phone: string): string => {
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Ensure + is only at the start
  if (cleaned.startsWith("+")) {
    return cleaned.slice(0, 16); // Max phone length with country code
  }
  return cleaned.slice(0, 15);
};

/**
 * Sanitizes text input (for names, addresses, etc.)
 */
export const sanitizeText = (text: string, maxLength?: number): string => {
  let sanitized = sanitizeString(text);
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, " ");
  
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitizes URL input
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = sanitizeString(url);
  
  // Basic URL validation - must start with http:// or https://
  if (sanitized && !sanitized.match(/^https?:\/\//i)) {
    return "";
  }
  
  return sanitized.slice(0, 2048); // Max URL length
};

/**
 * Sanitizes an object by applying sanitization to string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  fieldSanitizers?: Partial<Record<keyof T, (value: unknown) => unknown>>
): T => {
  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (fieldSanitizers && key in fieldSanitizers && fieldSanitizers[key as keyof T]) {
      sanitized[key as keyof T] = fieldSanitizers[key as keyof T]!(value) as T[keyof T];
    } else if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    }
  }

  return sanitized;
};

