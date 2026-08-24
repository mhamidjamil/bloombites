const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/user-not-found': 'Invalid email or password. Please try again.',
  'auth/wrong-password': 'Invalid email or password. Please try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return FALLBACK_MESSAGE;
}
