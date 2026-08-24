import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2';
import { requireAdmin, AuthError } from '@/lib/server-auth';
import { logError } from '@/lib/observability';

// Extension is derived from a fixed allowlist, never from a client filename.
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    if (!isR2Configured || !r2Client) {
      return NextResponse.json(
        { error: 'Image storage is not configured.' },
        { status: 503 }
      );
    }

    const { contentType } = await req.json();
    const extension = MIME_EXTENSIONS[contentType];
    if (!extension) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, or WebP images are allowed.' },
        { status: 400 }
      );
    }

    const key = `${uuidv4()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logError('upload.presign', error, {});
    return NextResponse.json(
      { error: 'Could not prepare the upload. Please try again.' },
      { status: 500 }
    );
  }
}
