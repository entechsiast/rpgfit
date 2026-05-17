/**
 * Unit tests for reward system helpers (rewards.js).
 *
 * Extracted from progression.js (issue #234).
 */

import { processDailyReward, rollBonusReward, buildMilestoneReward } from './rewards';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const today = new Date().toDateString();

function makeState(overrides = {}) {
  return {
    lastRewardDate: null,
    todayRewardCount: 0,
    rewardStreak: 0,
    ownedEquipment: [],
    ...overrides,
  };
}

// ─── processDailyReward ───────────────────────────────────────────────────────

describe('processDailyReward', () => {
  it('grants full gold on first session of the day', () => {
    const state = makeState({ lastRewardDate: null });
    const result = processDailyReward(state, 100);
    expect(result.rewardGold).toBe(100);
    expect(result.newTodayCount).toBe(1);
  });

  it('grants full gold on second session of the same day', () => {
    const state = makeState({
      lastRewardDate: today,
      todayRewardCount: 1,
    });
    const result = processDailyReward(state, 100);
    expect(result.rewardGold).toBe(100);
    expect(result.newTodayCount).toBe(2);
  });

  it('grants zero gold on third session of the same day (anti-farming cap)', () => {
    const state = makeState({
      lastRewardDate: today,
      todayRewardCount: 2,
    });
    const result = processDailyReward(state, 100);
    expect(result.rewardGold).toBe(0);
    expect(result.newTodayCount).toBe(2);
  });

  it('resets counter on new day', () => {
    // First call: same day, already at cap
    const state = makeState({
      lastRewardDate: today,
      todayRewardCount: 2,
    });
    const result = processDailyReward(state, 100);
    expect(result.rewardGold).toBe(0);

    // Simulate new day by clearing lastRewardDate
    const result2 = processDailyReward({ ...result, lastRewardDate: null }, 100);
    expect(result2.rewardGold).toBe(100);
    expect(result2.newTodayCount).toBe(1);
  });

  it('preserves lastRewardDate when same day', () => {
    const state = makeState({ lastRewardDate: today, todayRewardCount: 0 });
    const result = processDailyReward(state, 100);
    expect(result.newLastDate).toBe(today);
  });

  it('updates lastRewardDate on new day', () => {
    const state = makeState({ lastRewardDate: 'Mon Jan 01 2024', todayRewardCount: 0 });
    const result = processDailyReward(state, 100);
    expect(result.newLastDate).toBe(today);
  });
});

// ─── rollBonusReward ──────────────────────────────────────────────────────────

describe('rollBonusReward', () => {
  it('resets streak on bonus win', () => {
    const state = makeState({ rewardStreak: 5 });
    const originalRandom = Math.random;
    let callIndex = 0;
    Math.random = () => {
      callIndex++;
      if (callIndex === 1) return 0.01; // bonus chance
      return 0.5; // gold bonus (40% threshold)
    };
    const result = rollBonusReward(state, 100);
    Math.random = originalRandom;
    expect(result.gotBonus).toBe(true);
    expect(result.newStreak).toBe(0);
  });

  it('increments streak on bonus miss', () => {
    const state = makeState({ rewardStreak: 3 });
    const originalRandom = Math.random;
    Math.random = () => 0.99; // miss bonus chance
    const result = rollBonusReward(state, 100);
    Math.random = originalRandom;
    expect(result.gotBonus).toBe(false);
    expect(result.newStreak).toBe(4);
  });

  it('produces deterministic results with controlled random', () => {
    const state = makeState({ rewardStreak: 0 });
    const originalRandom = Math.random;
    let callIndex = 0;
    Math.random = () => {
      callIndex++;
      if (callIndex === 1) return 0.01; // bonus hit
      if (callIndex === 2) return 0.1; // gold type
      return 0.5;
    };
    const result = rollBonusReward(state, 100);
    Math.random = originalRandom;
    expect(result.gotBonus).toBe(true);
    expect(result.bonusItem.bonusType).toBe('gold');
  });
});

// ─── buildMilestoneReward ─────────────────────────────────────────────────────

describe('buildMilestoneReward', () => {
  const timestamp = Date.now();

  it('returns a rare/uncommon item', () => {
    const result = buildMilestoneReward(2, 500, null, timestamp);
    expect(result.rareItem).toBeDefined();
    expect(result.rareItem.rarity).toMatch(/^(uncommon|rare)$/);
  });

  it('adds rare item to ownedEquipment', () => {
    const result = buildMilestoneReward(2, 500, null, timestamp);
    expect(result.newOwned).toContain(result.rareItem.id);
  });

  it('excludes bonusItem from ownedEquipment when bonus is not equipment', () => {
    const bonusItem = { bonusType: 'gold', amount: 200 };
    const result = buildMilestoneReward(2, 500, bonusItem, timestamp);
    expect(result.newOwned).not.toContain(bonusItem);
  });

  it('does not duplicate equipment bonusItem', () => {
    const bonusItem = { bonusType: 'equipment', item: 'test_item' };
    const result = buildMilestoneReward(2, 500, bonusItem, timestamp);
    expect(result.newOwned).toContain('test_item');
  });
});
