import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import 'dotenv/config'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.S3_BUCKET || '';
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || '';

export async function generateSignedUploadUrl(
  fileName: string,
  mimeType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const key = `uploads/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}/${key}` : uploadUrl.split('?')[0];

  return { uploadUrl, fileUrl };
}

