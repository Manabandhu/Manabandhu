import { getAuthHeaders } from "@/services/auth";
import {
  handleApiJsonResponse,
  handleApiNoContentResponse,
} from "@/shared/api/request-utils";
import { buildApiUrl } from "@/shared/utils/url";

const toHeaderRecord = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
};

const withAuthHeaders = async (headers?: HeadersInit): Promise<Record<string, string>> => {
  const authHeaders = await getAuthHeaders();
  return {
    ...authHeaders,
    ...toHeaderRecord(headers),
  };
};

export const apiRequest = async (path: string, init: RequestInit = {}): Promise<Response> => {
  return fetch(buildApiUrl(path), {
    ...init,
    headers: await withAuthHeaders(init.headers),
  });
};

export const apiRequestJson = async <T>(
  path: string,
  init: RequestInit = {},
  options: { successMessage?: string; fallbackErrorMessage?: string } = {}
): Promise<T> => {
  const response = await apiRequest(path, init);
  return handleApiJsonResponse<T>(
    response,
    options.successMessage,
    options.fallbackErrorMessage
  );
};

export const apiRequestNoContent = async (
  path: string,
  init: RequestInit = {},
  options: { successMessage?: string; fallbackErrorMessage?: string } = {}
): Promise<void> => {
  const response = await apiRequest(path, init);
  await handleApiNoContentResponse(
    response,
    options.successMessage,
    options.fallbackErrorMessage
  );
};
