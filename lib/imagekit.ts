const IK_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY ?? '';
const IK_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT ?? '';

function authHeader() {
  return 'Basic ' + Buffer.from(IK_PRIVATE_KEY + ':').toString('base64');
}

export type IKUploadResult = {
  url: string;
  name: string;
  size: number;
  fileId: string;
};

export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  folder: string,
): Promise<IKUploadResult> {
  if (!IK_PRIVATE_KEY || !IK_URL_ENDPOINT) {
    throw new Error('ImageKit env vars not configured (IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT)');
  }

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buffer)]), fileName);
  form.append('fileName', fileName);
  form.append('folder', folder);
  form.append('useUniqueFileName', 'true');

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: authHeader() },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ImageKit upload failed: ${text}`);
  }

  const data = await res.json();
  return {
    url: data.url as string,
    name: data.name as string,
    size: data.size as number,
    fileId: data.fileId as string,
  };
}
