/**
 * Unit tests for floor advancement helpers (floors.js).
 *
 * Extracted from progression.js (issue #234).
 */

import { checkFloorAdvancement, getNextFloor, applyFloorAdvance, buildFloorAdvanceLog } from './floors';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeState(overrides = {}) {
  return {
    currentFloor: 1,
    currentFloorProgress: 0,
    gold: 0,
    ownedEquipment: [],
    rewardLog: [],
    combatLog: [],
    ...overrides,
  };
}

// ─── checkFloorAdvancement ────────────────────────────────────────────────────

describe('checkFloorAdvancement', () => {
  it('returns false when progress is below sessionsRequired', () => {
    const state = makeState({ currentFloor: 1, currentFloorProgress: 0 });
    expect(checkFloorAdvancement(state)).toBe(false);
  });

  it('returns true when progress meets sessionsRequired', () => {
    // Floor 1 requires 2 sessions
    const state = makeState({ currentFloor: 1, currentFloorProgress: 2 });
    expect(checkFloorAdvancement(state)).toBe(true);
  });

  it('returns true when progress exceeds sessionsRequired', () => {
    const state = makeState({ currentFloor: 1, currentFloorProgress: 3 });
    expect(checkFloorAdvancement(state)).toBe(true);
  });

  it('returns false when progress is one below sessionsRequired', () => {
    const state = makeState({ currentFloor: 1, currentFloorProgress: 1 });
    expect(checkFloorAdvancement(state)).toBe(false);
  });

  it('uses correct sessionsRequired for floor 2 (3 sessions)', () => {
    const state = makeState({ currentFloor: 2, currentFloorProgress: 2 });
    expect(checkFloorAdvancement(state)).toBe(false);
  });

  it('returns true for floor 2 when progress meets 3', () => {
    const state = makeState({ currentFloor: 2, currentFloorProgress: 3 });
    expect(checkFloorAdvancement(state)).toBe(true);
  });
});

// ─── getNextFloor ─────────────────────────────────────────────────────────────

describe('getNextFloor', () => {
  it('returns currentFloor + 1', () => {
    const state = makeState({ currentFloor: 1 });
    expect(getNextFloor(state)).toBe(2);
  });

  it('works for higher floors', () => {
    const state = makeState({ currentFloor: 4 });
    expect(getNextFloor(state)).toBe(5);
  });
});

// ─── applyFloorAdvance ────────────────────────────────────────────────────────

describe('applyFloorAdvance', () => {
  it('returns correct nextFloor', () => {
    const state = makeState({ currentFloor: 1 });
    const result = applyFloorAdvance(state, null);
    expect(result.nextFloor).toBe(2);
  });

  it('returns correct goldReward', () => {
    const state = makeState({ currentFloor: 1 });
    const result = applyFloorAdvance(state, null);
    expect(result.goldReward).toBe(500);
  });

  it('returns a newOwned array with the rare item', () => {
    const state = makeState({ currentFloor: 1, ownedEquipment: [] });
    const result = applyFloorAdvance(state, null);
    expect(result.newOwned).toBeDefined();
    expect(result.newOwned).toHaveLength(1);
  });

  it('returns a rewardLog with milestone entry', () => {
    const state = makeState({ currentFloor: 1, rewardLog: [] });
    const result = applyFloorAdvance(state, null);
    expect(result.newRewardLog).toBeDefined();
    expect(result.newRewardLog[0].type).toBe('milestone');
    expect(result.newRewardLog[0].gold).toBe(500);
    expect(result.newRewardLog[0].floor).toBe(2);
  });

  it('includes floor name and celebration text', () => {
    const state = makeState({ currentFloor: 1, rewardLog: [] });
    const result = applyFloorAdvance(state, null);
    expect(result.nextFloorName).toBe('The Ember Gallery');
    expect(result.celebrationText).toBeDefined();
  });

  it('includes timestamp', () => {
    const state = makeState({ currentFloor: 1 });
    const result = applyFloorAdvance(state, null);
    expect(typeof result.timestamp).toBe('number');
  });
});

// ─── buildFloorAdvanceLog ─────────────────────────────────────────────────────

describe('buildFloorAdvanceLog', () => {
  it('returns a floor_advanced log entry', () => {
    const state = makeState({ currentFloor: 1 });
    const result = applyFloorAdvance(state, null);
    const log = buildFloorAdvanceLog(state, result);
    expect(log.type).toBe('floor_advanced');
  });

  it('records fromFloor and toFloor', () => {
    const state = makeState({ currentFloor: 3 });
    const advanceResult = applyFloorAdvance(state, null);
    const log = buildFloorAdvanceLog(state, advanceResult);
    expect(log.fromFloor).toBe(3);
    expect(log.toFloor).toBe(4);
  });

  it('includes goldReward', () => {
    const state = makeState({ currentFloor: 1 });
    const advanceResult = applyFloorAdvance(state, null);
    const log = buildFloorAdvanceLog(state, advanceResult);
    expect(log.goldReward).toBe(500);
  });

  it('includes timestamp', () => {
    const state = makeState({ currentFloor: 1 });
    const advanceResult = applyFloorAdvance(state, null);
    const log = buildFloorAdvanceLog(state, advanceResult);
    expect(typeof log.timestamp).toBe('number');
  });
});
