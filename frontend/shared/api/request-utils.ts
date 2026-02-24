import { toast } from "@/lib/toast";

const extractErrorMessage = async (
  response: Response,
  fallbackErrorMessage?: string
): Promise<string> => {
  const errorData = await response.json().catch(() => ({}));
  if (typeof errorData?.message === "string" && errorData.message.trim()) {
    return errorData.message;
  }
  if (typeof errorData?.error === "string" && errorData.error.trim()) {
    return errorData.error;
  }
  if (fallbackErrorMessage?.trim()) {
    return fallbackErrorMessage;
  }
  return `HTTP ${response.status}`;
};

export const handleApiJsonResponse = async <T>(
  response: Response,
  successMessage?: string,
  fallbackErrorMessage?: string
): Promise<T> => {
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackErrorMessage));
  }

  if (successMessage) {
    toast.showSuccess(successMessage);
  }

  return (await response.json()) as T;
};

export const handleApiNoContentResponse = async (
  response: Response,
  successMessage?: string,
  fallbackErrorMessage?: string
): Promise<void> => {
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackErrorMessage));
  }

  if (successMessage) {
    toast.showSuccess(successMessage);
  }
};

export const getRequestErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};
