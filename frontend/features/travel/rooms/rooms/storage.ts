export async function uploadRoomImageAsync(uri: string): Promise<string> {
  return uri;
}

export async function uploadRoomImagesAsync(uris: string[]): Promise<string[]> {
  return Promise.all(uris.map(uploadRoomImageAsync));
}
