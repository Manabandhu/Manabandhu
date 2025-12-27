import { auth } from '@/lib/firebase';

/**
 * Centralized utility for retrieving Firebase authentication tokens
 * Use this instead of directly accessing auth.currentUser.getIdToken()
 */
export async function getAuthToken(): Promise<string | undefined> {
  try {
    const user = auth?.currentUser;
    if (!user) {
      return undefined;
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
}

/**
 * Get auth headers for API requests
 * Returns headers with Authorization Bearer token if user is authenticated
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

