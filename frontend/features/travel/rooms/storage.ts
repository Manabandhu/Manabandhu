export async function uploadRoomImage(uri: string, _ownerUserId?: string): Promise<string> {
  return uri;
}

export async function uploadRoomImages(
  uris: string[],
  ownerUserId?: string
): Promise<string[]> {
  return Promise.all(uris.map((uri) => uploadRoomImage(uri, ownerUserId)));
}

export const uploadRoomImageAsync = uploadRoomImage;
export const uploadRoomImagesAsync = uploadRoomImages;
