export const CONSUMABLES = [
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'Restores 30 HP',
    type: 'consumable',
    effect: { type: 'heal', value: 30 },
    rarity: 'common',
    price: 25,
  },
  {
    id: 'greater_healing_potion',
    name: 'Greater Healing Potion',
    description: 'Restores 60 HP',
    type: 'consumable',
    effect: { type: 'heal', value: 60 },
    rarity: 'uncommon',
    price: 60,
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 20 MP',
    type: 'consumable',
    effect: { type: 'mana', value: 20 },
    rarity: 'common',
    price: 20,
  },
  {
    id: 'greater_mana_potion',
    name: 'Greater Mana Potion',
    description: 'Restores 50 MP',
    type: 'consumable',
    effect: { type: 'mana', value: 50 },
    rarity: 'uncommon',
    price: 50,
  },
  {
    id: 'strength_elixir',
    name: 'Elixir of Strength',
    description: 'Temporarily +2 STR for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'str', value: 2 },
    rarity: 'uncommon',
    price: 45,
  },
  {
    id: 'dexterity_elixir',
    name: 'Elixir of Dexterity',
    description: 'Temporarily +2 DEX for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'dex', value: 2 },
    rarity: 'uncommon',
    price: 45,
  },
  {
    id: 'iron_skin_scroll',
    name: 'Scroll of Iron Skin',
    description: 'Temporarily +3 CON for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'con', value: 3 },
    rarity: 'rare',
    price: 80,
  },
  {
    id: 'arcane_blessing_scroll',
    name: 'Scroll of Arcane Blessing',
    description: 'Temporarily +2 INT and +2 WIS for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff', stat: 'arcane', value: 2 },
    rarity: 'rare',
    price: 80,
  },
  {
    id: 'elixir_of_might',
    name: 'Elixir of Might',
    description: 'Temporarily +3 STR and +2 CON for 1 dungeon',
    type: 'consumable',
    effect: { type: 'buff_multi', str: 3, con: 2 },
    rarity: 'rare',
    price: 120,
  },
  {
    id: 'phoenix_draught',
    name: 'Phoenix Draught',
    description: 'Fully restores HP and MP',
    type: 'consumable',
    effect: { type: 'full_restore', value: 0 },
    rarity: 'epic',
    price: 200,
  },
];

export const SHOP_ITEMS = [
  ...CONSUMABLES,
  // Add more shop items as needed
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

export function getShopItems() {
  return SHOP_ITEMS;
}

export function getShopItemById(id) {
  return SHOP_ITEMS.find(item => item.id === id);
}
