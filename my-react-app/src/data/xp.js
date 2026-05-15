export function getXpToNextLevel(level) {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

export function getTotalXpToLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpToNextLevel(i);
  }
  return total;
}

export function calculateLevelFromXp(totalXp) {
  let level = 1;
  let xpSpent = 0;
  while (true) {
    const needed = getXpToNextLevel(level);
    if (xpSpent + needed > totalXp) {
      return level;
    }
    xpSpent += needed;
    level++;
    if (level > 60) return 60;
  }
}

export function getXpProgress(level, currentXp) {
  const needed = getXpToNextLevel(level);
  const xpForCurrentLevel = currentXp - getTotalXpToLevel(level);
  return {
    current: xpForCurrentLevel,
    needed,
    percentage: Math.min(100, (xpForCurrentLevel / needed) * 100),
  };
}

export const MAX_LEVEL = 60;
