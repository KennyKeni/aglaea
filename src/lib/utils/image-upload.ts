export interface UploadUrlResponse {
  imageId: string;
  uploadUrl: string;
  uploadToken: string;
  publicUrl: string;
  s3Key: string;
  maxSize: number;
}

interface WorkerResponse {
  success: boolean;
  imageId: string;
  size: number;
}

export interface UploadResult {
  imageId: string;
  publicUrl: string;
  s3Key: string;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

export type ImageUploadErrorType =
  | 'size_exceeded'
  | 'invalid_type'
  | 'upload_failed'
  | 'confirm_failed'
  | 'aborted';

export class ImageUploadError extends Error {
  constructor(
    public type: ImageUploadErrorType,
    message: string,
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DEFAULT_MAX_SIZE_MB = 10;

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

function uploadToWorker(
  url: string,
  file: File,
  token: string,
  onProgress?: UploadProgressCallback,
  signal?: AbortSignal,
): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new ImageUploadError('aborted', 'Upload cancelled'));
      });
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as WorkerResponse;
          resolve(response);
        } catch {
          reject(new ImageUploadError('upload_failed', 'Invalid response from upload worker'));
        }
      } else {
        reject(new ImageUploadError('upload_failed', `Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ImageUploadError('upload_failed', 'Network error during upload'));
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('X-Upload-Token', token);
    xhr.send(file);
  });
}

export async function uploadImage(
  file: File,
  options?: {
    keyPrefix?: string;
    maxSizeMB?: number;
    onProgress?: UploadProgressCallback;
    signal?: AbortSignal;
  },
): Promise<UploadResult> {
  const { keyPrefix, maxSizeMB = DEFAULT_MAX_SIZE_MB, onProgress, signal } = options ?? {};

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError('invalid_type', `File type ${file.type} is not allowed`);
  }

  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxSizeMB) {
    throw new ImageUploadError(
      'size_exceeded',
      `File size ${sizeMB.toFixed(1)}MB exceeds limit of ${maxSizeMB}MB`,
    );
  }

  const [dimensions, urlResponse] = await Promise.all([
    getImageDimensions(file),
    fetch('/api/images/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, contentLength: file.size, keyPrefix }),
    }).then(async (res) => {
      if (!res.ok) {
        throw new ImageUploadError('upload_failed', 'Failed to get upload URL');
      }
      return res.json() as Promise<UploadUrlResponse>;
    }),
  ]);

  if (signal?.aborted) {
    throw new ImageUploadError('aborted', 'Upload cancelled');
  }

  const workerResponse = await uploadToWorker(
    urlResponse.uploadUrl,
    file,
    urlResponse.uploadToken,
    onProgress,
    signal,
  );

  const confirmRes = await fetch(`/api/images/${urlResponse.imageId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      width: dimensions.width,
      height: dimensions.height,
      fileSize: file.size,
    }),
  });

  if (!confirmRes.ok) {
    throw new ImageUploadError('confirm_failed', 'Failed to confirm upload');
  }

  return {
    imageId: urlResponse.imageId,
    publicUrl: urlResponse.publicUrl,
    s3Key: urlResponse.s3Key,
    width: dimensions.width,
    height: dimensions.height,
  };
}
