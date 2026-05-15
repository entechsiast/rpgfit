import React, { createContext, useContext, useReducer } from 'react';
import { getClassById } from '../data/classes';
import { getRaceById } from '../data/races';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../data/stats';
import { getDungeonById, getDungeonsForLevel } from '../data/dungeons';
import { getMonstersByDungeon, getBossByDungeon } from '../data/monsters';
import { calculateMaxHp, calculateHpGainOnLevelUp, calculateMaxMp, calculateMpGainOnLevelUp } from '../data/combat';
import { getXpToNextLevel, getTotalXpToLevel, getXpProgress, MAX_LEVEL } from '../data/xp';
import { getItemById, getRandomLoot } from '../data/loot';
import { CONSUMABLES } from '../data/consumables';

const SLOT_ORDER = ['head', 'chest', 'pants', 'boots', 'rightHand', 'leftHand', 'accessory1', 'accessory2', 'accessory3'];

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
};

function calculatePointsRemaining(stats) {
  const totalSpent = Object.values(stats).reduce((sum, val) => sum + (val - BASE_STAT), 0);
  return TOTAL_POINTS - totalSpent;
}

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

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_CLASS': {
      const cls = getClassById(action.payload);
      if (!cls) return state;
      const newStats = { ...state.stats };
      STATS.forEach(stat => { newStats[stat.id] = BASE_STAT; });
      const points = calculatePointsRemaining(newStats);
      const hpMp = { maxHP: calculateMaxHp(cls.id, BASE_STAT, 1), currentHP: calculateMaxHp(cls.id, BASE_STAT, 1), maxMP: calculateMaxMp(BASE_STAT, BASE_STAT, 1), currentMP: calculateMaxMp(BASE_STAT, BASE_STAT, 1) };
      return {
        ...state,
        class: cls,
        stats: newStats,
        pointsRemaining: points,
        selectedSkillIds: new Set(cls.startingSkills),
        ...hpMp,
      };
    }

    case 'SET_RACE': {
      const race = getRaceById(action.payload);
      if (!race) return state;
      return { ...state, race };
    }

    case 'INCREMENT_STAT': {
      const statId = action.payload;
      const currentStat = state.stats[statId];
      if (currentStat >= MAX_STAT) return state;
      if (state.pointsRemaining <= 0) return state;
      const newStats = { ...state.stats, [statId]: currentStat + 1 };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: calculatePointsRemaining(newStats),
        ...recalcHPAndMP({ ...state, stats: newStats }),
      };
    }

    case 'DECREMENT_STAT': {
      const statId = action.payload;
      const currentStat = state.stats[statId];
      if (currentStat <= BASE_STAT) return state;
      const newStats = { ...state.stats, [statId]: currentStat - 1 };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: calculatePointsRemaining(newStats),
        ...recalcHPAndMP({ ...state, stats: newStats }),
      };
    }

    case 'SET_APPEARANCE':
      return {
        ...state,
        appearance: { ...state.appearance, [action.payload.key]: action.payload.value },
      };

    case 'TOGGLE_SKILL': {
      const skillId = action.payload;
      const newSet = new Set(state.selectedSkillIds);
      if (newSet.has(skillId)) newSet.delete(skillId);
      else newSet.add(skillId);
      return { ...state, selectedSkillIds: newSet };
    }

    case 'EQUIP_ITEM': {
      const { slot, item } = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = item;
      const equippedBonuses = getEquippedBonuses(newEquipment);
      const effectiveCon = state.stats.con + equippedBonuses.con;
      const effectiveInt = state.stats.int + equippedBonuses.int;
      const effectiveWis = state.stats.wis + equippedBonuses.wis;
      const hpMp = {
        maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
        maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
      };
      return {
        ...state,
        equipment: newEquipment,
        currentHP: Math.min(state.currentHP, hpMp.maxHP),
        currentMP: Math.min(state.currentMP, hpMp.maxMP),
        ...hpMp,
      };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = null;
      const equippedBonuses = getEquippedBonuses(newEquipment);
      const effectiveCon = state.stats.con + equippedBonuses.con;
      const effectiveInt = state.stats.int + equippedBonuses.int;
      const effectiveWis = state.stats.wis + equippedBonuses.wis;
      const hpMp = {
        maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
        maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
      };
      return {
        ...state,
        equipment: newEquipment,
        currentHP: Math.min(state.currentHP, hpMp.maxHP),
        currentMP: Math.min(state.currentMP, hpMp.maxMP),
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

    case 'DISTRIBUTE_STAT': {
      const { statId, value } = action.payload;
      const currentStat = state.stats[statId];
      const newStats = { ...state.stats, [statId]: currentStat + value };
      const newPointsRemaining = state.pointsRemaining - value;
      const equippedBonuses = getEquippedBonuses(state.equipment);
      const effectiveCon = newStats.con + equippedBonuses.con;
      const effectiveInt = newStats.int + equippedBonuses.int;
      const effectiveWis = newStats.wis + equippedBonuses.wis;
      const hpMp = {
        maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
        maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
      };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: newPointsRemaining,
        statPointsToSpend: Math.max(0, state.statPointsToSpend - value),
        ...hpMp,
      };
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

    case 'BUY_ITEM': {
      const { itemId, quantity = 1 } = action.payload;
      const item = CONSUMABLES.find(c => c.id === itemId);
      if (!item) return state;
      const cost = item.price * quantity;
      if (state.gold < cost) return state;

      let newState = {
        ...state,
        gold: state.gold - cost,
        consumables: { ...state.consumables, [itemId]: (state.consumables?.[itemId] || 0) + quantity },
      };
      return { ...newState, combatLog: [...newState.combatLog, { type: 'purchase', itemId: item.name, cost, timestamp: Date.now() }] };
    }

    case 'CLEAR_BUFFS':
      return { ...state, temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } };

    case 'REST': {
      const goldCost = Math.max(1, Math.floor(state.level * 5));
      const hpGain = state.maxHP - state.currentHP;
      const mpGain = state.maxMP - state.currentMP;
      return {
        ...state,
        gold: Math.max(0, state.gold - goldCost),
        currentHP: state.maxHP,
        currentMP: state.maxMP,
        combatLog: [...state.combatLog, { type: 'rest', goldCost, hpGain, mpGain, timestamp: Date.now() }],
      };
    }

    case 'COMBAT_RESULT': {
      const { monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, hpRemaining, mpRemaining } = action.payload;
      return {
        ...state,
        currentHP: hpRemaining,
        currentMP: mpRemaining,
        combatLog: [...state.combatLog, { type: 'combat', monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, timestamp: Date.now() }],
      };
    }

    case 'CLEAR_COMBAT_LOG':
      return { ...state, combatLog: [] };

    case 'SET_CURRENT_DUNGEON':
      return { ...state, currentDungeon: action.payload };

    case 'START_COMBAT': {
      const dungeon = getDungeonById(action.payload);
      if (!dungeon) return state;
      const monsters = getMonstersByDungeon(action.payload);
      return { ...state, combatState: { active: true, monsters: monsters.map(m => ({ ...m, currentHp: m.hp })), boss: getBossByDungeon(action.payload), currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] } };
    }

    case 'FLEE_COMBAT': {
      if (!state.combatState || !state.combatState.active) return state;
      const cs = state.combatState;
      // 50% chance to flee
      const succeeded = Math.random() < 0.5;
      if (succeeded) {
        return {
          ...state,
          currentHP: state.currentHP - Math.floor(state.maxHP * 0.1),
          combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
          combatLog: [...state.combatLog, { type: 'fled', timestamp: Date.now() }],
        };
      }
      // Failed flee - take penalty damage
      const currentMonster = cs.monsters[cs.currentMonsterIndex] || cs.boss;
      const penaltyDamage = currentMonster ? Math.floor(currentMonster.attack * 1.5) : 10;
      return {
        ...state,
        currentHP: Math.max(0, state.currentHP - penaltyDamage),
        combatLog: [...state.combatLog, { type: 'fled_failed', penaltyDamage, timestamp: Date.now() }],
      };
    }

    case 'RESOLVE_COMBAT': {
      if (!state.combatState || !state.combatState.active) return state;
      const cs = state.combatState;
      if (cs.currentMonsterIndex >= cs.monsters.length && cs.bossDefeated) {
        const dungeon = getDungeonById(state.currentDungeon);
        const completionReward = dungeon.completionReward;
        const bonusGold = Math.floor(Math.random() * (completionReward.gold[1] - completionReward.gold[0])) + completionReward.gold[0];
        const guaranteedItem = getItemById(completionReward.guaranteedItem);
        return {
          ...state,
          xp: state.xp + cs.totalXp + completionReward.xp,
          gold: state.gold + cs.totalGold + bonusGold,
          combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
          completedDungeons: state.completedDungeons.includes(state.currentDungeon) ? state.completedDungeons : [...state.completedDungeons, state.currentDungeon],
          combatLog: [...state.combatLog, { type: 'dungeon_complete', dungeonId: state.currentDungeon, totalXp: cs.totalXp + completionReward.xp, totalGold: cs.totalGold + bonusGold, guaranteedItem: guaranteedItem, timestamp: Date.now() }],
        };
      }

      let currentMonster = cs.monsters[cs.currentMonsterIndex];
      if (!currentMonster) currentMonster = cs.boss;
      if (!currentMonster) return state;

      const equippedBonuses = getEquippedBonuses(state.equipment);
      const effectiveStr = state.stats.str + equippedBonuses.str;
      const effectiveDex = state.stats.dex + equippedBonuses.dex;
      const effectiveCon = state.stats.con + equippedBonuses.con;
      const effectiveInt = state.stats.int + equippedBonuses.int;
      const effectiveWis = state.stats.wis + equippedBonuses.wis;
      const effectiveCha = state.stats.cha + equippedBonuses.cha;

      const playerAttack = effectiveStr + Math.floor(effectiveDex / 2) + Math.floor(effectiveCha / 4);
      const playerDefense = effectiveCon + Math.floor(effectiveDex / 3);
      const playerDamage = Math.max(1, playerAttack - currentMonster.defense + Math.floor(Math.random() * 5) - 2);
      const monsterDamage = Math.max(1, currentMonster.attack - playerDefense + Math.floor(Math.random() * 5) - 2);

      let newCurrentHp = currentMonster.currentHp - playerDamage;
      let newPlayerHp = state.currentHP - monsterDamage;

      if (newCurrentHp <= 0) {
        let newCs = { ...cs, monstersDefeated: cs.monstersDefeated + (cs.currentMonsterIndex < cs.monsters.length ? 1 : 0), totalXp: cs.totalXp + Math.floor(currentMonster.xpReward / 2), totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]), lootDrops: [...cs.lootDrops, getRandomLoot(currentMonster.lootTable || [])].filter(Boolean), currentMonsterIndex: cs.currentMonsterIndex + 1 };
        if (cs.currentMonsterIndex >= cs.monsters.length && cs.boss) {
          newCs.bossDefeated = true;
          newCs.bossHp = 0;
        }
        const goldReward = Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0])) + currentMonster.goldReward[0];
        return {
          ...state,
          currentHP: Math.max(0, newPlayerHp),
          combatState: newCs,
          combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage, monsterDamage, monsterHpRemaining: newCurrentHp, playerHpRemaining: newPlayerHp, goldReward, timestamp: Date.now() }],
        };
      }

      let newCs = { ...cs, currentMonsterIndex: cs.currentMonsterIndex + 1, monstersDefeated: cs.monstersDefeated + 1, totalXp: cs.totalXp + currentMonster.xpReward, totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]) };
      const loot = getRandomLoot(currentMonster.lootTable || []);
      if (loot) newCs.lootDrops = [...cs.lootDrops, loot];

      return {
        ...state,
        currentHP: Math.max(0, newPlayerHp),
        combatState: newCs,
        combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage, monsterDamage, monsterHpRemaining: newCurrentHp, playerHpRemaining: newPlayerHp, loot, timestamp: Date.now() }],
      };
    }

    case 'LOAD_CHARACTER': {
      const loadedEquipment = action.payload.equipment || createEmptyEquipment();
      const hpMp = action.payload.maxHP ? { maxHP: action.payload.maxHP, currentHP: action.payload.currentHP || action.payload.maxHP, maxMP: action.payload.maxMP, currentMP: action.payload.currentMP || action.payload.maxMP } : { maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5 };
      return {
        ...initialState,
        ...action.payload,
        equipment: loadedEquipment,
        selectedSkillIds: new Set(action.payload.selectedSkillIds || []),
        ...hpMp,
        completedDungeons: action.payload.completedDungeons || [],
        statPointsToSpend: action.payload.statPointsToSpend || 0,
        consumables: action.payload.consumables || {},
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
    }

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

const CharacterContext = createContext(null);
const CharacterDispatchContext = createContext(null);

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const allBonuses = getAllBonuses(state);

  return (
    <CharacterContext.Provider value={{ ...state, equippedBonuses, allBonuses }}>
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
