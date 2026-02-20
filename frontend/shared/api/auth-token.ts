import { tokenStorage } from '@/services/auth';

export async function getAuthToken(): Promise<string | undefined> {
  return (await tokenStorage.getAccessToken()) || undefined;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
