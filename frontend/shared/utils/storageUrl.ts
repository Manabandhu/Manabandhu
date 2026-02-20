export const toDownloadUrl = async (url: string): Promise<string> => url;
export const normalizeImageUrls = async (urls: string[]): Promise<string[]> => urls;
export const isStorageMetadataUrl = (url: string): boolean => url.includes('/o?name=');
