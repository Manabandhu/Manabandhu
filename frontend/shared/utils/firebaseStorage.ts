import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Converts a Firebase Storage metadata URL to a download URL
 * Handles URLs in format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o?name={path}
 */
export async function convertToDownloadURL(metadataUrl: string): Promise<string> {
  try {
    // Check if it's already a download URL (has alt=media or token parameter)
    if (metadataUrl.includes('alt=media') || metadataUrl.includes('token=')) {
      return metadataUrl;
    }

    // Check if it's a metadata URL (has ?name= parameter)
    const url = new URL(metadataUrl);
    const nameParam = url.searchParams.get('name');
    
    if (nameParam) {
      // Extract the path from the name parameter
      const storageRef = ref(storage, nameParam);
      return await getDownloadURL(storageRef);
    }

    // If it's already a download URL or doesn't match expected format, return as-is
    return metadataUrl;
  } catch (error) {
    console.error('Error converting Firebase Storage URL:', error);
    // Return original URL if conversion fails
    return metadataUrl;
  }
}

/**
 * Normalizes an array of Firebase Storage URLs to download URLs
 */
export async function normalizeImageUrls(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(url => convertToDownloadURL(url)));
}

/**
 * Synchronously checks if a URL is a Firebase Storage metadata URL
 * (doesn't require async conversion)
 */
export function isMetadataUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has('name') && !urlObj.searchParams.has('alt');
  } catch {
    return false;
  }
}

