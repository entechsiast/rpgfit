import { CLASSES } from './classes';

export function calculateMaxHp(classId, conStat, level) {
  const cls = CLASSES.find(c => c.id === classId);
  if (!cls) return 10;

  const hitDieValues = { 'd4': 4, 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 };
  const hitDie = hitDieValues[cls.hitDie] || 8;
  const conModifier = Math.floor((conStat - 8) / 2);
  const level1Con = Math.floor(conModifier / 2);
  const levelBonus = (level - 1) * (Math.floor(hitDie / 2) + level1Con);
  return hitDie + conModifier + levelBonus;
}

export function calculateHpGainOnLevelUp(classId, conStat) {
  const cls = CLASSES.find(c => c.id === classId);
  if (!cls) return 1;

  const hitDieValues = { 'd4': 4, 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 };
  const hitDie = hitDieValues[cls.hitDie] || 8;
  const conModifier = Math.floor((conStat - 8) / 2);
  const gain = hitDie + Math.floor(conModifier / 2);
  return Math.max(1, gain);
}

export function calculateMaxMp(intStat, wisStat, level) {
  const intModifier = Math.floor((intStat - 8) / 2);
  const wisModifier = Math.floor((wisStat - 8) / 2);
  return Math.floor(intModifier / 2) + Math.floor(wisModifier / 2) + Math.max(0, (level - 1) * 2);
}

export function calculateMpGainOnLevelUp(intStat, wisStat) {
  const intModifier = Math.floor((intStat - 8) / 2);
  const wisModifier = Math.floor((wisStat - 8) / 2);
  const gain = Math.floor(intModifier / 2) + Math.floor(wisModifier / 2) + 1;
  return Math.max(1, gain);
}

export function getHitDie(classId) {
  const cls = CLASSES.find(c => c.id === classId);
  return cls ? cls.hitDie : 'd8';
}

export function getHitDieValue(hitDie) {
  const values = { 'd4': 4, 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 };
  return values[hitDie] || 8;
}

export function getModifier(statValue) {
  return Math.floor((statValue - 8) / 2);
}
