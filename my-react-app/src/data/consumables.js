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

export function getConsumableById(id) {
  return CONSUMABLES.find(c => c.id === id);
}

export function getConsumablesByType(type) {
  return CONSUMABLES.filter(c => c.type === type);
}

export function getConsumablesByRarity(rarity) {
  return CONSUMABLES.filter(c => c.rarity === rarity);
}
