import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2';
import { requireAdmin, AuthError } from '@/lib/server-auth';
import { logError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    // Current uploads: an R2 object under the public bucket URL.
    if (isR2Configured && r2Client && R2_PUBLIC_URL && url.startsWith(`${R2_PUBLIC_URL}/`)) {
      const key = url.slice(R2_PUBLIC_URL.length + 1);
      try {
        await r2Client.send(
          new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
        );
        return NextResponse.json({ success: true });
      } catch (error) {
        logError('items.delete.r2', error, { key });
        return NextResponse.json(
          { error: 'Could not delete the image from storage.' },
          { status: 500 }
        );
      }
    }

    // Guarded fallback: legacy images saved to the local filesystem before
    // the R2 migration, served from /items/<filename>.
    if (url.startsWith('/items/')) {
      const filename = url.slice('/items/'.length);
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid image path.' }, { status: 400 });
      }

      const filePath = path.join(process.cwd(), 'public', 'items', filename);
      try {
        await fs.unlink(filePath);
        return NextResponse.json({ success: true });
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === 'ENOENT') {
          return NextResponse.json({ error: 'Image already removed.' }, { status: 404 });
        }
        logError('items.delete.legacy', error, { filename });
        return NextResponse.json(
          { error: 'Could not delete the image from storage.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Unrecognized image URL.' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logError('items.delete', error, {});
    return NextResponse.json(
      { error: 'Something went wrong deleting the image.' },
      { status: 500 }
    );
  }
}
