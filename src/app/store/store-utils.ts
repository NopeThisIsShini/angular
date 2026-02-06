/**
 * Simple status tracking for any async operation.
 */
export type CallState = 'init' | 'loading' | 'loaded' | { error: string };

/**
 * Initial empty state for CallState
 */
export const callState = (): CallState => 'init';

/**
 * Utility to extract error message from any error object
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  return error?.message || error?.error?.message || 'An unexpected error occurred';
}
