/* eslint-disable max-lines */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getDungeonById, getDungeonsForLevel } from '../data/dungeons';
import { getMonstersByDungeon, getBossByDungeon } from '../data/monsters';
import { calculateHpGainOnLevelUp, calculateMaxHp, calculateMaxMp, calculateMpGainOnLevelUp } from '../data/combat';
import { getXpToNextLevel, getTotalXpToLevel, getXpProgress, MAX_LEVEL } from '../data/xp';
import { CONSUMABLES } from '../data/consumables';
import { getFloorRequirements, getFloorCelebrationText } from '../data/floors';
import { getAllItems, SLOT_ORDER } from '../data/equipment';
import { BASE_STAT, TOTAL_POINTS } from '../data/stats';
import { characterCoreReducer } from './reducers/characterCore';

const createEmptyEquipment = () => {
  const eq = {};
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
};

const initialState = {
  name: '',
  class: null,
  race: null,
  stats: { str: BASE_STAT, dex: BASE_STAT, con: BASE_STAT, int: BASE_STAT, wis: BASE_STAT, cha: BASE_STAT },
  pointsRemaining: TOTAL_POINTS,
  appearance: {
    hairColor: 'brown',
    skinTone: 'fair',
    eyeColor: 'brown',
    hairStyle: 'short',
    build: 'average',
  },
  skills: [],
  selectedSkillIds: new Set(),
  equipment: createEmptyEquipment(),
  ownedEquipment: [],
  level: 1,
  xp: 0,
  gold: 0,
  maxHP: 10,
  currentHP: 10,
  maxMP: 5,
  currentMP: 5,
  combatLog: [],
  completedDungeons: [],
  statPointsToSpend: 0,
  consumables: {},
  temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
  sessions: [],
  currentFloor: 1,
  currentFloorProgress: 0,
  rewardStreak: 0,
  todayRewardCount: 0,
  lastRewardDate: null,
  rewardLog: [],
  animationEnabled: true,
};

function getEquippedBonuses(equipment) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  SLOT_ORDER.forEach(slot => {
    const item = equipment[slot];
    if (item && item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, val]) => {
        bonuses[stat] = (bonuses[stat] || 0) + val;
      });
    }
  });
  return bonuses;
}

function getTemporaryBuffs(state) {
  return state.temporaryBuffs || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

function getAllBonuses(state) {
  const equipped = getEquippedBonuses(state.equipment);
  const buffs = getTemporaryBuffs(state);
  const result = { ...equipped };
  Object.keys(buffs).forEach(stat => {
    result[stat] = (equipped[stat] || 0) + (buffs[stat] || 0);
  });
  return result;
}

function recalcHPAndMP(state) {
  if (!state.class) return { maxHP: 10, currentHP: state.currentHP, maxMP: 5, currentMP: state.currentMP };
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const effectiveCon = state.stats.con + equippedBonuses.con;
  const effectiveInt = state.stats.int + equippedBonuses.int;
  const effectiveWis = state.stats.wis + equippedBonuses.wis;
  const newMaxHP = calculateMaxHp(state.class.id, effectiveCon, state.level);
  const newMaxMP = calculateMaxMp(effectiveInt, effectiveWis, state.level);
  return {
    maxHP: newMaxHP,
    currentHP: Math.min(state.currentHP, newMaxHP),
    maxMP: newMaxMP,
    currentMP: Math.min(state.currentMP, newMaxMP),
  };
}

/* eslint-disable-next-line complexity */
function reducer(state, action) {
  // Dispatch core cases to sub-reducer
  const coreResult = characterCoreReducer(state, action);
  if (coreResult !== state) return coreResult;

  switch (action.type) {
    case 'EQUIP_ITEM': {
      const { slot, item } = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = item;
      const newOwned = state.ownedEquipment?.filter(id => id !== item.id) || [];
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        ...hpMp,
      };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const item = state.equipment[slot];
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = null;
      let newOwned = [...(state.ownedEquipment || [])];
      if (item && !newOwned.includes(item.id)) {
        newOwned.push(item.id);
      }
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        ...hpMp,
      };
    }

    case 'GAIN_XP': {
      const newXp = state.xp + action.payload;
      let newState = { ...state, xp: newXp };
      const needed = getXpToNextLevel(newState.level);
      if (newXp >= getTotalXpToLevel(newState.level) + needed && newState.level < MAX_LEVEL) {
        newState = { ...newState, statPointsToSpend: newState.statPointsToSpend + 1 };
      }
      return newState;
    }

    case 'LEVEL_UP': {
      let newState = { ...state, level: state.level + 1, xp: state.xp - getXpToNextLevel(state.level), statPointsToSpend: state.statPointsToSpend + 1 };
      if (!newState.class) return newState;
      const equippedBonuses = getEquippedBonuses(newState.equipment);
      const effectiveCon = newState.stats.con + equippedBonuses.con;
      const effectiveInt = newState.stats.int + equippedBonuses.int;
      const effectiveWis = newState.stats.wis + equippedBonuses.wis;
      const hpGain = calculateHpGainOnLevelUp(newState.class.id, effectiveCon);
      const mpGain = calculateMpGainOnLevelUp(effectiveInt, effectiveWis);
      newState = {
        ...newState,
        maxHP: newState.maxHP + hpGain,
        currentHP: newState.currentHP + hpGain,
        maxMP: newState.maxMP + mpGain,
        currentMP: newState.currentMP + mpGain,
      };
      return newState;
    }

    case 'ADD_GOLD':
      return { ...state, gold: state.gold + action.payload };

    case 'ADD_CONSUMABLE': {
      const { itemId, quantity = 1 } = action.payload;
      const current = state.consumables?.[itemId] || 0;
      return { ...state, consumables: { ...state.consumables, [itemId]: current + quantity } };
    }

    case 'REMOVE_CONSUMABLE': {
      const { itemId, quantity = 1 } = action.payload;
      const current = state.consumables?.[itemId] || 0;
      const newCount = current - quantity;
      if (newCount <= 0) {
        const newConsumables = { ...state.consumables };
        delete newConsumables[itemId];
        return { ...state, consumables: newConsumables };
      }
      return { ...state, consumables: { ...state.consumables, [itemId]: newCount } };
    }

    case 'USE_CONSUMABLE': {
      const itemId = action.payload;
      const consumable = CONSUMABLES.find(c => c.id === itemId);
      if (!consumable || !state.consumables?.[itemId]) return state;

      const effect = consumable.effect;
      let newState = { ...state };

      if (effect.type === 'heal') {
        newState = {
          ...newState,
          currentHP: Math.min(newState.maxHP, newState.currentHP + effect.value),
        };
      } else if (effect.type === 'mana') {
        newState = {
          ...newState,
          currentMP: Math.min(newState.maxMP, newState.currentMP + effect.value),
        };
      } else if (effect.type === 'full_restore') {
        newState = {
          ...newState,
          currentHP: newState.maxHP,
          currentMP: newState.maxMP,
        };
      } else if (effect.type === 'buff' && effect.stat) {
        const buffs = { ...getTemporaryBuffs(newState) };
        buffs[effect.stat] = (buffs[effect.stat] || 0) + effect.value;
        newState.temporaryBuffs = buffs;
      } else if (effect.type === 'buff_multi') {
        const buffs = { ...getTemporaryBuffs(newState) };
        Object.entries(effect).forEach(([stat, val]) => {
          if (stat !== 'type') {
            buffs[stat] = (buffs[stat] || 0) + val;
          }
        });
        newState.temporaryBuffs = buffs;
      }

      // Remove one from inventory
      const current = newState.consumables[itemId] - 1;
      if (current <= 0) {
        const newConsumables = { ...newState.consumables };
        delete newConsumables[itemId];
        newState.consumables = newConsumables;
      } else {
        newState.consumables = { ...newState.consumables, [itemId]: current };
      }

      return { ...newState, combatLog: [...newState.combatLog, { type: 'consumable_used', itemId: consumable.name, timestamp: Date.now() }] };
    }

    case 'ADD_SESSION': {
      const newSession = {
        type: action.payload.type,
        duration: action.payload.duration,
        notes: action.payload.notes || '',
        date: action.payload.date || new Date().toISOString(),
      };
      const newSessions = [...(state.sessions || []), newSession];
      const newProgress = (state.currentFloorProgress || 0) + 1;

      // --- Reward System ---
      const today = new Date().toDateString();
      let newTodayCount = state.todayRewardCount || 0;
      let newLastDate = state.lastRewardDate;

      // Reset daily counter if new day
      if (newLastDate !== today) {
        newTodayCount = 0;
        newLastDate = today;
      }

      // Calculate base gold reward (scales with duration)
      const baseGold = Math.max(5, Math.floor(action.payload.duration * 10));

      // Check anti-farming: max 2 guaranteed rewards per day
      let rewardGold = 0;
      if (newTodayCount < 2) {
        rewardGold = baseGold;
        newTodayCount++;
      }

      // Pity timer logic
      const streak = state.rewardStreak || 0;
      const bonusChance = Math.min(1, 0.15 + streak * 0.15);
      const gotBonus = Math.random() < bonusChance;

      let bonusItem = null;
      let newStreak = streak + 1;

      if (gotBonus) {
        newStreak = 0;
        // Roll bonus reward type
        const bonusRoll = Math.random();
        if (bonusRoll < 0.4) {
          // Extra gold: 2x-3x the base gold
          bonusItem = { bonusType: 'gold', amount: Math.floor(baseGold * (2 + Math.random())) };
        } else if (bonusRoll < 0.7) {
          // Random common equipment
          const equipItems = getAllItems().filter(i => i.rarity === 'common');
          const picked = equipItems[Math.floor(Math.random() * equipItems.length)];
          if (picked) bonusItem = { bonusType: 'equipment', item: picked.id };
        } else {
          // Random consumable
          const consumable = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];
          if (consumable) bonusItem = { bonusType: 'consumable', item: consumable.id };
        }
      }
      // --- End Reward System ---

      const timestamp = Date.now();
      const newRewardLog = [...(state.rewardLog || [])];

      // Check for floor advancement
      const floorReq = getFloorRequirements(state.currentFloor || 1);
      const sessionsNeeded = floorReq.sessionsRequired;

      if (newProgress >= sessionsNeeded) {
        const nextFloor = (state.currentFloor || 1) + 1;
        const nextFloorReq = getFloorRequirements(nextFloor);

        // Floor milestone: 500 gold + random Uncommon/Rare equipment
        const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
        const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
        const milestoneGold = 500;

        let finalGold = state.gold + milestoneGold + rewardGold;
        let finalOwned = [...(state.ownedEquipment || [])];

        if (rareItem && rareItem.id && !finalOwned.includes(rareItem.id)) {
          finalOwned.push(rareItem.id);
        }

        // Push milestone reward
        newRewardLog.push({
          type: 'milestone',
          gold: milestoneGold,
          item: rareItem ? rareItem.id : null,
          itemName: rareItem ? rareItem.name : null,
          floor: nextFloor,
          floorName: nextFloorReq.name,
          celebrationText: getFloorCelebrationText(nextFloor),
          timestamp,
        });

        // Push guaranteed reward
        if (rewardGold > 0) {
          newRewardLog.push({
            type: 'guaranteed',
            gold: rewardGold,
            date: today,
            timestamp,
          });
        }

        if (gotBonus) {
          newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });
        }

        return {
          ...state,
          sessions: newSessions,
          currentFloor: nextFloor,
          currentFloorProgress: 0,
          gold: finalGold,
          ownedEquipment: finalOwned,
          rewardStreak: newStreak,
          todayRewardCount: newTodayCount,
          lastRewardDate: newLastDate,
          rewardLog: newRewardLog,
          combatLog: [
            ...(state.combatLog || []),
            {
              type: 'floor_advanced',
              fromFloor: state.currentFloor,
              toFloor: nextFloor,
              floorName: nextFloorReq.name,
              goldReward: milestoneGold,
              timestamp,
            },
          ],
        };
      }

      // Push guaranteed reward
      const newRewardGold = rewardGold;
      if (newRewardGold > 0) {
        newRewardLog.push({
          type: 'guaranteed',
          gold: newRewardGold,
          date: today,
          timestamp,
        });
      }

      if (gotBonus) {
        newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });
      }

      return {
        ...state,
        sessions: newSessions,
        currentFloorProgress: newProgress,
        gold: state.gold + newRewardGold,
        rewardStreak: newStreak,
        todayRewardCount: newTodayCount,
        lastRewardDate: newLastDate,
        rewardLog: newRewardLog,
      };
    }

    case 'ADVANCE_FLOOR': {
      const nextFloor = (state.currentFloor || 1) + 1;
      const nextFloorReq = getFloorRequirements(nextFloor);

      // Floor milestone: random Uncommon/Rare equipment item
      const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
      const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];

      let newOwned = [...(state.ownedEquipment || [])];
      if (rareItem && rareItem.id && !newOwned.includes(rareItem.id)) {
        newOwned.push(rareItem.id);
      }

      const timestamp = Date.now();
      const newRewardLog = [...(state.rewardLog || [])];
      newRewardLog.push({
        type: 'milestone',
        gold: 500,
        item: rareItem ? rareItem.id : null,
        itemName: rareItem ? rareItem.name : null,
        floor: nextFloor,
        floorName: nextFloorReq.name,
        celebrationText: getFloorCelebrationText(nextFloor),
        timestamp,
      });

      return {
        ...state,
        currentFloor: nextFloor,
        currentFloorProgress: 0,
        gold: state.gold + 500,
        ownedEquipment: newOwned,
        rewardLog: newRewardLog,
        combatLog: [
          ...(state.combatLog || []),
          {
            type: 'floor_advanced',
            fromFloor: state.currentFloor,
            toFloor: nextFloor,
            floorName: nextFloorReq.name,
            goldReward: 500,
            timestamp,
          },
        ],
      };
    }

    case 'SET_CURRENT_DUNGEON':
      return { ...state, currentDungeon: action.payload };

    case 'LOAD_CHARACTER': {
      const loadedEquipment = action.payload.equipment || createEmptyEquipment();
      const hpMp = action.payload.maxHP ? { maxHP: action.payload.maxHP, currentHP: action.payload.currentHP || action.payload.maxHP, maxMP: action.payload.maxMP, currentMP: action.payload.currentMP || action.payload.maxMP } : { maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5 };
      return {
        ...initialState,
        ...action.payload,
        equipment: loadedEquipment,
        ownedEquipment: action.payload.ownedEquipment || [],
        selectedSkillIds: new Set(action.payload.selectedSkillIds || []),
        ...hpMp,
        completedDungeons: action.payload.completedDungeons || [],
        statPointsToSpend: action.payload.statPointsToSpend || 0,
        consumables: action.payload.consumables || {},
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        sessions: action.payload.sessions || [],
        currentFloor: action.payload.currentFloor || 1,
        currentFloorProgress: action.payload.currentFloorProgress || 0,
        rewardStreak: action.payload.rewardStreak || 0,
        todayRewardCount: action.payload.todayRewardCount || 0,
        lastRewardDate: action.payload.lastRewardDate || null,
        rewardLog: action.payload.rewardLog || [],
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'TOGGLE_ANIMATION':
      return { ...state, animationEnabled: action.payload };

    default:
      return equipmentReducer(state, action) || combatReducer(state, action) || state;
  }
}

const CharacterContext = createContext(() => {
  throw new Error('useCharacter must be used within a CharacterProvider');
});
const CharacterDispatchContext = createContext(() => {
  throw new Error('useCharacterDispatch must be used within a CharacterProvider');
});

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const allBonuses = getAllBonuses(state);

  const value = useMemo(() => ({ ...state, equippedBonuses, allBonuses }), [state, equippedBonuses, allBonuses]);

  return (
    <CharacterContext.Provider value={value}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export function useCharacterDispatch() {
  return useContext(CharacterDispatchContext);
}

export { getXpProgress, getDungeonsForLevel };

// Exported for testing
export { reducer, initialState, getEquippedBonuses, getAllBonuses, recalcHPAndMP, createEmptyEquipment };
