import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSession, isAdmin } from '@/lib/auth';

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const publicBase = process.env.S3_PUBLIC_URL;
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;

const s3 =
  endpoint && bucket && accessKey && secretKey
    ? new S3Client({
        region: 'us-east-1',
        endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      })
    : null;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!s3 || !bucket || !publicBase) {
    return NextResponse.json(
      { error: 'Upload service not configured' },
      { status: 503 }
    );
  }
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large (max 10 MB)' },
      { status: 400 }
    );
  }
  const type = file.type || 'application/octet-stream';
  if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'File type not allowed' },
      { status: 400 }
    );
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${Date.now()}-${safeName}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: type,
      })
    );
  } catch (e) {
    console.error('S3 upload error:', e);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
  const fileUrl = `${publicBase}/${key}`;
  return NextResponse.json({ fileUrl });
}
