import { bucket } from '../lib/firebase';
import { fail } from '../lib/errors';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

export function validateUpload(contentType: string, sizeBytes: number) {
  if (!IMAGE_TYPES.has(contentType) && !VIDEO_TYPES.has(contentType)) {
    fail('invalid-argument', 'Only image and video uploads are supported.');
  }

  const maxBytes = IMAGE_TYPES.has(contentType)
    ? 10 * 1024 * 1024
    : 50 * 1024 * 1024;

  if (sizeBytes > maxBytes) {
    fail('invalid-argument', 'Upload exceeds the allowed size limit.');
  }
}

export function buildUploadPath(userId: string, kind: 'avatar' | 'issue', fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${userId}/${kind}/${Date.now()}_${safeName}`;
}

export async function fetchFileBuffer(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    fail('internal', `Unable to fetch media from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getSignedDownloadUrl(path: string) {
  const [url] = await bucket.file(path).getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return url;
}

