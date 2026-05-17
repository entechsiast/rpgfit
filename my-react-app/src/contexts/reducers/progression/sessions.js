/**
 * Session tracking helpers for progression.
 *
 * Extracted from progression.js (issue #234).
 * Handles session creation and logging.
 */

/**
 * Create a new session object from payload data.
 */
export function createSession(payload) {
  return {
    type: payload.type,
    duration: payload.duration,
    notes: payload.notes || '',
    date: payload.date || new Date().toISOString(),
  };
}

/**
 * Append a session to the sessions array.
 */
export function addSession(sessions, payload) {
  return [...sessions, createSession(payload)];
}
