export const DUNGEONS = [
  {
    id: 'goblin_caves',
    name: 'Goblin Caves',
    description: 'A network of underground tunnels infested with goblins and their chieftain.',
    levelRange: [1, 3],
    difficulty: 'Easy',
    monsters: [
      { id: 'goblin_scout', name: 'Goblin Scout', level: 1, hp: 15, attack: 4, defense: 1, xpReward: 25, goldReward: [5, 15], lootTable: [{ itemId: 'leather_cap', weight: 10 }, { itemId: 'leather_boots', weight: 10 }, { itemId: 'healing_potion', weight: 20 }] },
      { id: 'goblin_thug', name: 'Goblin Thug', level: 2, hp: 25, attack: 6, defense: 2, xpReward: 40, goldReward: [10, 25], lootTable: [{ itemId: 'chain_mail', weight: 8 }, { itemId: 'healing_potion', weight: 15 }, { itemId: 'iron_helm', weight: 5 }] },
      { id: 'goblin_shaman', name: 'Goblin Shaman', level: 3, hp: 30, attack: 8, defense: 3, xpReward: 55, goldReward: [15, 35], lootTable: [{ itemId: 'mage_hood', weight: 8 }, { itemId: 'healing_potion', weight: 15 }, { itemId: 'charm_luck', weight: 3 }] },
    ],
    boss: { id: 'goblin_chieftain', name: 'Goblin Chieftain', level: 3, hp: 60, attack: 12, defense: 5, xpReward: 150, goldReward: [50, 100], lootTable: [{ itemId: 'orc_helm', weight: 15 }, { itemId: 'battleaxe', weight: 15 }, { itemId: 'healing_potion', weight: 25 }] },
    completionReward: { xp: 200, gold: [100, 200], guaranteedItem: 'ring_strength' },
  },
  {
    id: 'dark_forest_ruins',
    name: 'Dark Forest Ruins',
    description: 'Ancient ruins overtaken by dark magic, haunted by spectral creatures.',
    levelRange: [3, 5],
    difficulty: 'Medium',
    monsters: [
      { id: 'forest_wolf', name: 'Forest Wolf', level: 3, hp: 35, attack: 10, defense: 4, xpReward: 60, goldReward: [20, 40], lootTable: [{ itemId: 'leather_trousers', weight: 10 }, { itemId: 'healing_potion', weight: 20 }, { itemId: 'long_bow', weight: 5 }] },
      { id: 'tree_spirit', name: 'Tree Spirit', level: 4, hp: 45, attack: 12, defense: 6, xpReward: 80, goldReward: [25, 50], lootTable: [{ itemId: 'ranger_pants', weight: 8 }, { itemId: 'healing_potion', weight: 15 }, { itemId: 'amulet_wisdom', weight: 4 }] },
      { id: 'shadow_stalker', name: 'Shadow Stalker', level: 5, hp: 55, attack: 15, defense: 7, xpReward: 100, goldReward: [30, 60], lootTable: [{ itemId: 'dagger', weight: 10 }, { itemId: 'healing_potion', weight: 15 }, { itemId: 'cloak_shadows', weight: 3 }] },
      { id: 'corrupted_wildling', name: 'Corrupted Wildling', level: 5, hp: 60, attack: 14, defense: 8, xpReward: 110, goldReward: [35, 65], lootTable: [{ itemId: 'ranger_cloak', weight: 8 }, { itemId: 'healing_potion', weight: 15 }, { itemId: 'charm_luck', weight: 4 }] },
    ],
    boss: { id: 'forest_wraith', name: 'Forest Wraith', level: 5, hp: 120, attack: 20, defense: 10, xpReward: 300, goldReward: [100, 200], lootTable: [{ itemId: 'mage_robe', weight: 15 }, { itemId: 'fire_staff', weight: 15 }, { itemId: 'healing_potion', weight: 20 }] },
    completionReward: { xp: 400, gold: [200, 400], guaranteedItem: 'belt_giants' },
  },
  {
    id: 'abandoned_mine',
    name: 'Abandoned Mine',
    description: 'A deep mine collapsed long ago, now home to monstrous creatures and ancient treasures.',
    levelRange: [5, 7],
    difficulty: 'Hard',
    monsters: [
      { id: 'mine_golem', name: 'Mine Golem', level: 5, hp: 80, attack: 18, defense: 12, xpReward: 130, goldReward: [40, 80], lootTable: [{ itemId: 'iron_greaves', weight: 10 }, { itemId: 'iron_leggings', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'cave_spider', name: 'Cave Spider', level: 6, hp: 70, attack: 22, defense: 8, xpReward: 150, goldReward: [50, 90], lootTable: [{ itemId: 'dagger', weight: 10 }, { itemId: 'off_hand_dagger', weight: 8 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'rock_elemental', name: 'Rock Elemental', level: 7, hp: 100, attack: 25, defense: 15, xpReward: 180, goldReward: [60, 100], lootTable: [{ itemId: 'iron_plate', weight: 8 }, { itemId: 'chain_mail', weight: 10 }, { itemId: 'talisman_warding', weight: 5 }] },
      { id: 'mine_guardian', name: 'Mine Guardian', level: 7, hp: 110, attack: 24, defense: 14, xpReward: 200, goldReward: [70, 110], lootTable: [{ itemId: 'iron_helm', weight: 10 }, { itemId: 'iron_greaves', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
    ],
    boss: { id: 'cave_troll', name: 'Cave Troll', level: 7, hp: 200, attack: 30, defense: 18, xpReward: 500, goldReward: [200, 400], lootTable: [{ itemId: 'iron_plate', weight: 20 }, { itemId: 'tower_shield', weight: 15 }, { itemId: 'healing_potion', weight: 20 }] },
    completionReward: { xp: 800, gold: [400, 800], guaranteedItem: 'talisman_warding' },
  },
  {
    id: 'dragons_peak',
    name: "Dragon's Peak",
    description: 'A volcanic mountain peak where ancient dragons have made their lair.',
    levelRange: [7, 10],
    difficulty: 'Very Hard',
    monsters: [
      { id: 'drake', name: 'Drake', level: 7, hp: 130, attack: 28, defense: 16, xpReward: 250, goldReward: [80, 150], lootTable: [{ itemId: 'iron_greaves', weight: 10 }, { itemId: 'iron_plate', weight: 8 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'fire_serpent', name: 'Fire Serpent', level: 8, hp: 160, attack: 32, defense: 18, xpReward: 300, goldReward: [100, 180], lootTable: [{ itemId: 'fire_staff', weight: 10 }, { itemId: 'chain_mail', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'dragon_knight', name: 'Dragon Knight', level: 9, hp: 180, attack: 35, defense: 22, xpReward: 350, goldReward: [120, 200], lootTable: [{ itemId: 'iron_helm', weight: 12 }, { itemId: 'tower_shield', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'lava_giant', name: 'Lava Giant', level: 10, hp: 220, attack: 38, defense: 24, xpReward: 400, goldReward: [150, 250], lootTable: [{ itemId: 'iron_plate', weight: 15 }, { itemId: 'iron_greaves', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
    ],
    boss: { id: 'elder_dragon', name: 'Elder Dragon', level: 10, hp: 400, attack: 45, defense: 28, xpReward: 1000, goldReward: [500, 1000], lootTable: [{ itemId: 'paladin_armor', weight: 20 }, { itemId: 'holy_mace', weight: 15 }, { itemId: 'healing_potion', weight: 20 }] },
    completionReward: { xp: 2000, gold: [1000, 2000], guaranteedItem: 'cloak_shadows' },
  },
  {
    id: 'abyssal_throne',
    name: 'The Abyssal Throne',
    description: 'The deepest abyss, where the lord of darkness resides with his elite guardians.',
    levelRange: [10, 15],
    difficulty: 'Extreme',
    monsters: [
      { id: 'abyssal_fiend', name: 'Abyssal Fiend', level: 10, hp: 250, attack: 40, defense: 25, xpReward: 500, goldReward: [200, 400], lootTable: [{ itemId: 'chain_mail', weight: 10 }, { itemId: 'iron_greaves', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'demon_lord', name: 'Demon Lord', level: 12, hp: 350, attack: 50, defense: 30, xpReward: 700, goldReward: [300, 500], lootTable: [{ itemId: 'tower_shield', weight: 12 }, { itemId: 'iron_helm', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'shadow_knight', name: 'Shadow Knight', level: 13, hp: 400, attack: 55, defense: 35, xpReward: 800, goldReward: [350, 600], lootTable: [{ itemId: 'iron_plate', weight: 15 }, { itemId: 'fire_staff', weight: 8 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'abyssal_warrior', name: 'Abyssal Warrior', level: 14, hp: 450, attack: 58, defense: 38, xpReward: 900, goldReward: [400, 700], lootTable: [{ itemId: 'chain_mail', weight: 10 }, { itemId: 'iron_greaves', weight: 10 }, { itemId: 'healing_potion', weight: 15 }] },
      { id: 'dark_priest', name: 'Dark Priest', level: 15, hp: 380, attack: 60, defense: 32, xpReward: 950, goldReward: [450, 750], lootTable: [{ itemId: 'mage_hood', weight: 10 }, { itemId: 'talisman_warding', weight: 8 }, { itemId: 'healing_potion', weight: 15 }] },
    ],
    boss: { id: 'abyssal_lord', name: 'Abyssal Lord', level: 15, hp: 800, attack: 70, defense: 45, xpReward: 2500, goldReward: [1500, 3000], lootTable: [{ itemId: 'paladin_armor', weight: 25 }, { itemId: 'crown', weight: 20 }, { itemId: 'healing_potion', weight: 20 }] },
    completionReward: { xp: 5000, gold: [3000, 6000], guaranteedItem: 'crown' },
  },
];

export function getDungeonById(id) {
  return DUNGEONS.find(d => d.id === id);
}

export function getDungeonsForLevel(level) {
  return DUNGEONS.filter(d => {
    const minLevel = d.levelRange[0] - 2;
    const maxLevel = d.levelRange[1] + 2;
    return level >= minLevel && level <= maxLevel;
  });
}
