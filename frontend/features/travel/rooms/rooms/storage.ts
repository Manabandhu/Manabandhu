import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadRoomImages = async (uris: string[], ownerUserId: string) => {
  const uploads = uris.map(async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = uri.split("/").pop() || `room-${Date.now()}`;
    const storageRef = ref(storage, `rooms/${ownerUserId}/${Date.now()}-${fileName}`);
    const snapshot = await uploadBytes(storageRef, blob);
    return getDownloadURL(snapshot.ref);
  });
  return Promise.all(uploads);
};
