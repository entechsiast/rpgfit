/**
 * Unit tests for outcome builders (outcomes.js).
 *
 * Extracted from progression.js (issue #234).
 */

import { buildFloorAdvanceResult, buildNoAdvanceResult } from './outcomes';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeState(overrides = {}) {
  return {
    currentFloor: 1,
    currentFloorProgress: 0,
    gold: 0,
    ownedEquipment: [],
    rewardLog: [],
    combatLog: [],
    rewardStreak: 0,
    todayRewardCount: 0,
    lastRewardDate: null,
    ...overrides,
  };
}

function makeContext(overrides = {}) {
  return {
    newSessions: [],
    newProgress: 2,
    rewardGold: 100,
    newStreak: 0,
    newTodayCount: 1,
    newLastDate: new Date().toDateString(),
    bonusItem: null,
    gotBonus: false,
    ...overrides,
  };
}

// ─── buildFloorAdvanceResult ──────────────────────────────────────────────────

describe('buildFloorAdvanceResult', () => {
  it('returns sessions array', () => {
    const state = makeState();
    const context = makeContext();
    const result = buildFloorAdvanceResult(state, context);
    expect(result.sessions).toBeDefined();
  });

  it('resets currentFloorProgress to 0', () => {
    const state = makeState({ currentFloorProgress: 5 });
    const context = makeContext();
    const result = buildFloorAdvanceResult(state, context);
    expect(result.currentFloorProgress).toBe(0);
  });

  it('advances to next floor', () => {
    const state = makeState({ currentFloor: 1 });
    const context = makeContext();
    const result = buildFloorAdvanceResult(state, context);
    expect(result.currentFloor).toBe(2);
  });

  it('adds gold reward (floor gold + session gold)', () => {
    const state = makeState({ gold: 0 });
    const context = makeContext({ rewardGold: 100 });
    const result = buildFloorAdvanceResult(state, context);
    // 500 (floor) + 100 (session) = 600
    expect(result.gold).toBe(600);
  });

  it('includes milestone reward log entry', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext();
    const result = buildFloorAdvanceResult(state, context);
    expect(result.rewardLog).toBeDefined();
    expect(result.rewardLog[0].type).toBe('milestone');
  });

  it('adds guaranteed reward to log', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ rewardGold: 100 });
    const result = buildFloorAdvanceResult(state, context);
    const guaranteed = result.rewardLog.find(e => e.type === 'guaranteed');
    expect(guaranteed).toBeDefined();
    expect(guaranteed.gold).toBe(100);
  });

  it('adds bonus reward to log when gotBonus', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ gotBonus: true, bonusItem: { bonusType: 'gold', amount: 200 } });
    const result = buildFloorAdvanceResult(state, context);
    const bonus = result.rewardLog.find(e => e.type === 'bonus');
    expect(bonus).toBeDefined();
    expect(bonus.bonusType).toBe('gold');
  });

  it('includes combat log entry', () => {
    const state = makeState({ combatLog: [] });
    const context = makeContext();
    const result = buildFloorAdvanceResult(state, context);
    expect(result.combatLog).toBeDefined();
    expect(result.combatLog[result.combatLog.length - 1].type).toBe('floor_advanced');
  });

  it('updates rewardStreak', () => {
    const state = makeState();
    const context = makeContext({ newStreak: 5 });
    const result = buildFloorAdvanceResult(state, context);
    expect(result.rewardStreak).toBe(5);
  });

  it('updates todayRewardCount', () => {
    const state = makeState();
    const context = makeContext({ newTodayCount: 2 });
    const result = buildFloorAdvanceResult(state, context);
    expect(result.todayRewardCount).toBe(2);
  });

  it('updates lastRewardDate', () => {
    const state = makeState();
    const context = makeContext({ newLastDate: 'Mon Jan 01 2024' });
    const result = buildFloorAdvanceResult(state, context);
    expect(result.lastRewardDate).toBe('Mon Jan 01 2024');
  });
});

// ─── buildNoAdvanceResult ─────────────────────────────────────────────────────

describe('buildNoAdvanceResult', () => {
  it('preserves currentFloor', () => {
    const state = makeState({ currentFloor: 3 });
    const context = makeContext();
    const result = buildNoAdvanceResult(state, context);
    expect(result.currentFloor).toBe(3);
  });

  it('updates currentFloorProgress', () => {
    const state = makeState({ currentFloorProgress: 1 });
    const context = makeContext({ newProgress: 2 });
    const result = buildNoAdvanceResult(state, context);
    expect(result.currentFloorProgress).toBe(2);
  });

  it('adds gold when rewardGold > 0', () => {
    const state = makeState({ gold: 0 });
    const context = makeContext({ rewardGold: 100 });
    const result = buildNoAdvanceResult(state, context);
    expect(result.gold).toBe(100);
  });

  it('does not add gold when rewardGold is 0', () => {
    const state = makeState({ gold: 50 });
    const context = makeContext({ rewardGold: 0 });
    const result = buildNoAdvanceResult(state, context);
    expect(result.gold).toBe(50);
  });

  it('includes guaranteed reward log when rewardGold > 0', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ rewardGold: 100 });
    const result = buildNoAdvanceResult(state, context);
    const guaranteed = result.rewardLog.find(e => e.type === 'guaranteed');
    expect(guaranteed).toBeDefined();
    expect(guaranteed.gold).toBe(100);
  });

  it('does not include guaranteed reward when rewardGold is 0', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ rewardGold: 0 });
    const result = buildNoAdvanceResult(state, context);
    const guaranteed = result.rewardLog.find(e => e.type === 'guaranteed');
    expect(guaranteed).toBeUndefined();
  });

  it('includes bonus reward log when gotBonus', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ gotBonus: true, bonusItem: { bonusType: 'gold', amount: 200 } });
    const result = buildNoAdvanceResult(state, context);
    const bonus = result.rewardLog.find(e => e.type === 'bonus');
    expect(bonus).toBeDefined();
    expect(bonus.bonusType).toBe('gold');
  });

  it('does not include bonus when gotBonus is false', () => {
    const state = makeState({ rewardLog: [] });
    const context = makeContext({ gotBonus: false });
    const result = buildNoAdvanceResult(state, context);
    const bonus = result.rewardLog.find(e => e.type === 'bonus');
    expect(bonus).toBeUndefined();
  });

  it('updates rewardStreak', () => {
    const state = makeState();
    const context = makeContext({ newStreak: 3 });
    const result = buildNoAdvanceResult(state, context);
    expect(result.rewardStreak).toBe(3);
  });

  it('updates todayRewardCount', () => {
    const state = makeState();
    const context = makeContext({ newTodayCount: 1 });
    const result = buildNoAdvanceResult(state, context);
    expect(result.todayRewardCount).toBe(1);
  });

  it('updates lastRewardDate', () => {
    const state = makeState();
    const context = makeContext({ newLastDate: 'Mon Jan 01 2024' });
    const result = buildNoAdvanceResult(state, context);
    expect(result.lastRewardDate).toBe('Mon Jan 01 2024');
  });
});
