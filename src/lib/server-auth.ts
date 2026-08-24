import { createRemoteJWKSet, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

export class AuthError extends Error {
  status: 401 | 403;
  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
  }
}

// Verifies the caller's Firebase ID token, then confirms the caller is an
// admin by reading their own users/{uid} doc through the Firestore REST API
// using that same token (allowed by firestore.rules). Throws AuthError.
export async function requireAdmin(
  request: NextRequest
): Promise<{ uid: string }> {
  if (!projectId) {
    throw new AuthError(401, 'Server authentication is not configured.');
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw new AuthError(401, 'Sign in required.');
  }

  let uid: string;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error('Token has no subject');
    }
    uid = payload.sub;
  } catch {
    throw new AuthError(401, 'Your session is invalid or has expired.');
  }

  const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
  const res = await fetch(docUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new AuthError(403, 'Admin access is required.');
  }

  const doc = await res.json();
  const role = doc?.fields?.role?.stringValue;
  if (role !== 'admin') {
    throw new AuthError(403, 'Admin access is required.');
  }

  return { uid };
}
