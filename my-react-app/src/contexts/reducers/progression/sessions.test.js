/**
 * Unit tests for session helpers (sessions.js).
 *
 * Extracted from progression.js (issue #234).
 */

import { createSession, addSession } from './sessions';

// ─── createSession ────────────────────────────────────────────────────────────

describe('createSession', () => {
  it('creates a session with all fields', () => {
    const payload = { type: 'dungeon', duration: 30, notes: 'Test run' };
    const result = createSession(payload);
    expect(result.type).toBe('dungeon');
    expect(result.duration).toBe(30);
    expect(result.notes).toBe('Test run');
    expect(result.date).toBeDefined();
  });

  it('defaults notes to empty string', () => {
    const payload = { type: 'dungeon', duration: 30 };
    const result = createSession(payload);
    expect(result.notes).toBe('');
  });

  it('uses provided date when given', () => {
    const date = '2024-01-15T10:00:00.000Z';
    const payload = { type: 'dungeon', duration: 30, date };
    const result = createSession(payload);
    expect(result.date).toBe(date);
  });

  it('generates ISO date when not provided', () => {
    const payload = { type: 'dungeon', duration: 30 };
    const result = createSession(payload);
    expect(new Date(result.date).toISOString()).toBeTruthy();
  });
});

// ─── addSession ───────────────────────────────────────────────────────────────

describe('addSession', () => {
  it('appends a session to an empty array', () => {
    const payload = { type: 'dungeon', duration: 30 };
    const result = addSession([], payload);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('dungeon');
  });

  it('appends a session to an existing array', () => {
    const existing = [{ type: 'dungeon', duration: 20, notes: '', date: '2024-01-01T00:00:00.000Z' }];
    const payload = { type: 'dungeon', duration: 30 };
    const result = addSession(existing, payload);
    expect(result).toHaveLength(2);
    expect(result[0].duration).toBe(20);
    expect(result[1].duration).toBe(30);
  });

  it('returns a new array (does not mutate)', () => {
    const existing = [{ type: 'dungeon', duration: 20, notes: '', date: '2024-01-01T00:00:00.000Z' }];
    const payload = { type: 'dungeon', duration: 30 };
    const result = addSession(existing, payload);
    expect(result).not.toBe(existing);
  });
});
