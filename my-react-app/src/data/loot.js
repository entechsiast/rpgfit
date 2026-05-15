import { EQUIPMENT, SLOT_ORDER } from './equipment';

export const LOOT_TABLES = {
  goblin_caves: [
    { itemId: 'leather_cap', weight: 15 },
    { itemId: 'leather_boots', weight: 15 },
    { itemId: 'healing_potion', weight: 25 },
    { itemId: 'iron_helm', weight: 5 },
    { itemId: 'chain_mail', weight: 5 },
    { itemId: 'orc_helm', weight: 2 },
  ],
  dark_forest_ruins: [
    { itemId: 'leather_trousers', weight: 12 },
    { itemId: 'ranger_pants', weight: 10 },
    { itemId: 'healing_potion', weight: 20 },
    { itemId: 'long_bow', weight: 8 },
    { itemId: 'mage_hood', weight: 8 },
    { itemId: 'amulet_wisdom', weight: 3 },
    { itemId: 'cloak_shadows', weight: 2 },
  ],
  abandoned_mine: [
    { itemId: 'iron_greaves', weight: 12 },
    { itemId: 'iron_leggings', weight: 12 },
    { itemId: 'healing_potion', weight: 20 },
    { itemId: 'tower_shield', weight: 8 },
    { itemId: 'iron_plate', weight: 6 },
    { itemId: 'talisman_warding', weight: 4 },
  ],
  dragons_peak: [
    { itemId: 'iron_greaves', weight: 10 },
    { itemId: 'iron_plate', weight: 12 },
    { itemId: 'healing_potion', weight: 18 },
    { itemId: 'fire_staff', weight: 10 },
    { itemId: 'chain_mail', weight: 10 },
    { itemId: 'holy_mace', weight: 5 },
  ],
  abyssal_throne: [
    { itemId: 'chain_mail', weight: 10 },
    { itemId: 'iron_greaves', weight: 12 },
    { itemId: 'healing_potion', weight: 18 },
    { itemId: 'tower_shield', weight: 10 },
    { itemId: 'iron_plate', weight: 12 },
    { itemId: 'paladin_armor', weight: 3 },
    { itemId: 'crown', weight: 2 },
  ],
};

export const DUNGEON_GUARANTEED_ITEMS = {
  goblin_caves: 'ring_strength',
  dark_forest_ruins: 'belt_giants',
  abandoned_mine: 'talisman_warding',
  dragons_peak: 'cloak_shadows',
  abyssal_throne: 'crown',
};

export const BOSS_GUARANTEED_ITEMS = {
  goblin_chieftain: 'orc_helm',
  forest_wraith: 'fire_staff',
  cave_troll: 'iron_plate',
  elder_dragon: 'paladin_armor',
  abyssal_lord: 'crown',
};

export const CONSUMABLES = [
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'Restores 30 HP',
    type: 'consumable',
    effect: { type: 'heal', value: 30 },
    rarity: 'common',
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 20 MP',
    type: 'consumable',
    effect: { type: 'mana', value: 20 },
    rarity: 'common',
  },
  {
    id: 'strength_elixir',
    name: 'Elixir of Strength',
    description: 'Temporarily +2 STR for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'str', value: 2 },
    rarity: 'uncommon',
  },
  {
    id: 'dexterity_elixir',
    name: 'Elixir of Dexterity',
    description: 'Temporarily +2 DEX for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'dex', value: 2 },
    rarity: 'uncommon',
  },
  {
    id: 'iron_skin_scroll',
    name: 'Scroll of Iron Skin',
    description: 'Temporarily +3 CON for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'con', value: 3 },
    rarity: 'rare',
  },
  {
    id: 'arcane_blessing_scroll',
    name: 'Scroll of Arcane Blessing',
    description: 'Temporarily +2 INT and +2 WIS for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'int', value: 2 },
    rarity: 'rare',
  },
];

export function getItemById(id) {
  const allEquipment = Object.values(EQUIPMENT).flat();
  const item = allEquipment.find(i => i.id === id);
  if (item) return item;

  const consumable = CONSUMABLES.find(c => c.id === id);
  if (consumable) return consumable;

  return null;
}

export function getRandomLoot(lootTable) {
  const totalWeight = lootTable.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of lootTable) {
    random -= entry.weight;
    if (random <= 0) {
      return getItemById(entry.itemId);
    }
  }
  return null;
}

export function getGuaranteedItemForDungeon(dungeonId) {
  return getItemById(DUNGEON_GUARANTEED_ITEMS[dungeonId]);
}

export function getBossGuaranteedItem(bossId) {
  return getItemById(BOSS_GUARANTEED_ITEMS[bossId]);
}
