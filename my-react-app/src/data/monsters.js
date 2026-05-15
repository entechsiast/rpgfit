export const MONSTERS = [
  // Dungeon 1: Goblin Caves
  { id: 'goblin_scout', name: 'Goblin Scout', dungeonId: 'goblin_caves', level: 1, hp: 15, maxHp: 15, attack: 4, defense: 1, xpReward: 25, goldReward: [5, 15] },
  { id: 'goblin_thug', name: 'Goblin Thug', dungeonId: 'goblin_caves', level: 2, hp: 25, maxHp: 25, attack: 6, defense: 2, xpReward: 40, goldReward: [10, 25] },
  { id: 'goblin_shaman', name: 'Goblin Shaman', dungeonId: 'goblin_caves', level: 3, hp: 30, maxHp: 30, attack: 8, defense: 3, xpReward: 55, goldReward: [15, 35] },
  { id: 'goblin_chieftain', name: 'Goblin Chieftain', dungeonId: 'goblin_caves', level: 3, hp: 60, maxHp: 60, attack: 12, defense: 5, xpReward: 150, goldReward: [50, 100], isBoss: true },

  // Dungeon 2: Dark Forest Ruins
  { id: 'forest_wolf', name: 'Forest Wolf', dungeonId: 'dark_forest_ruins', level: 3, hp: 35, maxHp: 35, attack: 10, defense: 4, xpReward: 60, goldReward: [20, 40] },
  { id: 'tree_spirit', name: 'Tree Spirit', dungeonId: 'dark_forest_ruins', level: 4, hp: 45, maxHp: 45, attack: 12, defense: 6, xpReward: 80, goldReward: [25, 50] },
  { id: 'shadow_stalker', name: 'Shadow Stalker', dungeonId: 'dark_forest_ruins', level: 5, hp: 55, maxHp: 55, attack: 15, defense: 7, xpReward: 100, goldReward: [30, 60] },
  { id: 'corrupted_wildling', name: 'Corrupted Wildling', dungeonId: 'dark_forest_ruins', level: 5, hp: 60, maxHp: 60, attack: 14, defense: 8, xpReward: 110, goldReward: [35, 65] },
  { id: 'forest_wraith', name: 'Forest Wraith', dungeonId: 'dark_forest_ruins', level: 5, hp: 120, maxHp: 120, attack: 20, defense: 10, xpReward: 300, goldReward: [100, 200], isBoss: true },

  // Dungeon 3: Abandoned Mine
  { id: 'mine_golem', name: 'Mine Golem', dungeonId: 'abandoned_mine', level: 5, hp: 80, maxHp: 80, attack: 18, defense: 12, xpReward: 130, goldReward: [40, 80] },
  { id: 'cave_spider', name: 'Cave Spider', dungeonId: 'abandoned_mine', level: 6, hp: 70, maxHp: 70, attack: 22, defense: 8, xpReward: 150, goldReward: [50, 90] },
  { id: 'rock_elemental', name: 'Rock Elemental', dungeonId: 'abandoned_mine', level: 7, hp: 100, maxHp: 100, attack: 25, defense: 15, xpReward: 180, goldReward: [60, 100] },
  { id: 'mine_guardian', name: 'Mine Guardian', dungeonId: 'abandoned_mine', level: 7, hp: 110, maxHp: 110, attack: 24, defense: 14, xpReward: 200, goldReward: [70, 110] },
  { id: 'cave_troll', name: 'Cave Troll', dungeonId: 'abandoned_mine', level: 7, hp: 200, maxHp: 200, attack: 30, defense: 18, xpReward: 500, goldReward: [200, 400], isBoss: true },

  // Dungeon 4: Dragon's Peak
  { id: 'drake', name: 'Drake', dungeonId: 'dragons_peak', level: 7, hp: 130, maxHp: 130, attack: 28, defense: 16, xpReward: 250, goldReward: [80, 150] },
  { id: 'fire_serpent', name: 'Fire Serpent', dungeonId: 'dragons_peak', level: 8, hp: 160, maxHp: 160, attack: 32, defense: 18, xpReward: 300, goldReward: [100, 180] },
  { id: 'dragon_knight', name: 'Dragon Knight', dungeonId: 'dragons_peak', level: 9, hp: 180, maxHp: 180, attack: 35, defense: 22, xpReward: 350, goldReward: [120, 200] },
  { id: 'lava_giant', name: 'Lava Giant', dungeonId: 'dragons_peak', level: 10, hp: 220, maxHp: 220, attack: 38, defense: 24, xpReward: 400, goldReward: [150, 250] },
  { id: 'elder_dragon', name: 'Elder Dragon', dungeonId: 'dragons_peak', level: 10, hp: 400, maxHp: 400, attack: 45, defense: 28, xpReward: 1000, goldReward: [500, 1000], isBoss: true },

  // Dungeon 5: The Abyssal Throne
  { id: 'abyssal_fiend', name: 'Abyssal Fiend', dungeonId: 'abyssal_throne', level: 10, hp: 250, maxHp: 250, attack: 40, defense: 25, xpReward: 500, goldReward: [200, 400] },
  { id: 'demon_lord', name: 'Demon Lord', dungeonId: 'abyssal_throne', level: 12, hp: 350, maxHp: 350, attack: 50, defense: 30, xpReward: 700, goldReward: [300, 500] },
  { id: 'shadow_knight', name: 'Shadow Knight', dungeonId: 'abyssal_throne', level: 13, hp: 400, maxHp: 400, attack: 55, defense: 35, xpReward: 800, goldReward: [350, 600] },
  { id: 'abyssal_warrior', name: 'Abyssal Warrior', dungeonId: 'abyssal_throne', level: 14, hp: 450, maxHp: 450, attack: 58, defense: 38, xpReward: 900, goldReward: [400, 700] },
  { id: 'dark_priest', name: 'Dark Priest', dungeonId: 'abyssal_throne', level: 15, hp: 380, maxHp: 380, attack: 60, defense: 32, xpReward: 950, goldReward: [450, 750] },
  { id: 'abyssal_lord', name: 'Abyssal Lord', dungeonId: 'abyssal_throne', level: 15, hp: 800, maxHp: 800, attack: 70, defense: 45, xpReward: 2500, goldReward: [1500, 3000], isBoss: true },
];

export function getMonstersByDungeon(dungeonId) {
  return MONSTERS.filter(m => m.dungeonId === dungeonId);
}

export function getMonstersByLevel(level) {
  return MONSTERS.filter(m => m.level >= Math.max(1, level - 2) && m.level <= level + 2);
}

export function getBossByDungeon(dungeonId) {
  return MONSTERS.find(m => m.dungeonId === dungeonId && m.isBoss);
}
