'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/observability';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError('global-error-boundary', error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          backgroundColor: '#F5F5DC',
          color: '#1F140D',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            BloomBites
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#5C4A3D' }}>
            We&apos;re sorry, the app hit an unexpected error. Please try
            again.
          </p>
        </div>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#3E2723',
            color: '#FFD700',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
