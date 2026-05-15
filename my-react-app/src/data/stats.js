export const STATS = [
  {
    id: 'str',
    name: 'Strength',
    abbreviation: 'STR',
    description: 'Physical power and melee combat ability',
    derived: ['hp', 'melee_attack', 'melee_damage', 'carrying_capacity'],
  },
  {
    id: 'dex',
    name: 'Dexterity',
    abbreviation: 'DEX',
    description: 'Agility, reflexes, and ranged combat ability',
    derived: ['armor_class', 'initiative', 'ranged_attack', 'reflex_save'],
  },
  {
    id: 'con',
    name: 'Constitution',
    abbreviation: 'CON',
    description: 'Health, stamina, and resistance to damage',
    derived: ['hp', 'fortitude_save', 'concentration'],
  },
  {
    id: 'int',
    name: 'Intelligence',
    abbreviation: 'INT',
    description: 'Knowledge, memory, and analytical thinking',
    derived: ['arcana', 'history', 'investigation', 'rc'],
  },
  {
    id: 'wis',
    name: 'Wisdom',
    abbreviation: 'WIS',
    description: 'Perception, intuition, and spiritual awareness',
    derived: ['perception', 'insight', 'medicine', 'survival', 'will_save'],
  },
  {
    id: 'cha',
    name: 'Charisma',
    abbreviation: 'CHA',
    description: 'Force of personality, leadership, and magic potency',
    derived: ['persuasion', 'deception', 'performance', 'intimidation'],
  },
];

export const BASE_STAT = 8;
export const MAX_STAT = 15;
export const TOTAL_POINTS = 27;

export function getStatById(id) {
  return STATS.find(s => s.id === id);
}
