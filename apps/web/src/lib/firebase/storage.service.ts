import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type FirebaseStorage,
  type UploadTask,
} from 'firebase/storage';

import { app } from './firebase';

export const storage = getStorage(app);

export function createStorageRef(path: string) {
  return ref(storage, path);
}

export function uploadFile(
  file: File,
  path: string,
  metadata?: Record<string, string>,
) {
  return uploadBytesResumable(createStorageRef(path), file, {
    customMetadata: metadata,
  });
}

export function getFileDownloadURL(path: string) {
  return getDownloadURL(createStorageRef(path));
}

export type { FirebaseStorage, UploadTask };
