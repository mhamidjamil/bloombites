// Structured error logging for API routes. Always logs to stdout for the
// VPS Datadog agent to pick up; also fires a direct log intake call when
// DD_API_KEY/DD_SITE are set, best-effort and never blocking the request.

interface LogContext {
  [key: string]: unknown;
}

export function logError(
  operation: string,
  error: unknown,
  context: LogContext = {}
): void {
  const message = error instanceof Error ? error.message : String(error);
  const entry = {
    operation,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(entry));

  const apiKey = process.env.DD_API_KEY;
  const site = process.env.DD_SITE;
  if (!apiKey || !site) return;

  fetch(`https://http-intake.logs.${site}/api/v2/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': apiKey,
    },
    body: JSON.stringify({ ...entry, ddsource: 'bloombites', service: 'bloombites' }),
  }).catch(() => {
    // Intake failures must never affect the request itself.
  });
}
