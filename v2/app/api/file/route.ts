import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSession, isAdmin } from '@/lib/auth';

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;

const s3 = endpoint && bucket && accessKey && secretKey ? new S3Client({
  region: 'us-east-1', endpoint, forcePathStyle: true,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
}) : null;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!s3 || !bucket) return NextResponse.json({ error: 'File service not configured' }, { status: 503 });
  let objectKey = req.nextUrl.searchParams.get('key') || null;
  if (!objectKey) {
    const urlParam = req.nextUrl.searchParams.get('url');
    const m = urlParam?.match(/\/td-tickets\/?([^?]*)/);
    if (m) objectKey = m[1];
  }
  if (!objectKey) return NextResponse.json({ error: 'Missing key or url parameter' }, { status: 400 });
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
    const body = res.Body;
    const contentType = res.ContentType || 'application/octet-stream';
    if (!body) return NextResponse.json({ error: 'Empty object' }, { status: 404 });
    const buf = await body.transformToByteArray();
    return new NextResponse(Buffer.from(buf), {
      headers: { 'Content-Type': contentType, 'Content-Disposition': `inline; filename="${objectKey.split('/').pop()}"` },
    });
  } catch (e) {
    console.error('S3 GetObject error:', e);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
