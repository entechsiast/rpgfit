import { CLASSES } from './classes';
import { RACES } from './races';

export const ALL_SKILLS = [
  // Combat skills
  { id: 'swordsmanship', name: 'Swordsmanship', description: 'Proficiency with blades and slashing weapons', category: 'combat', stat: 'str' },
  { id: 'shield_bash', name: 'Shield Bash', description: 'Use your shield to stun opponents', category: 'combat', stat: 'str' },
  { id: 'war_cry', name: 'War Cry', description: 'Inspire allies and demoralize foes', category: 'combat', stat: 'cha' },
  { id: 'fireball', name: 'Fireball', description: 'Hurl a ball of flames that explodes on impact', category: 'combat', stat: 'int' },
  { id: 'ice_storm', name: 'Ice Storm', description: 'Create a storm of ice shards that damages and slows', category: 'combat', stat: 'int' },
  { id: 'arcane_bolt', name: 'Arcane Bolt', description: 'Channel raw magical energy into a precise attack', category: 'combat', stat: 'int' },
  { id: 'sneak_attack', name: 'Sneak Attack', description: 'Strike a vulnerable target for extra damage', category: 'combat', stat: 'dex' },
  { id: 'archery', name: 'Archery', description: 'Proficiency with bows and ranged weapons', category: 'combat', stat: 'dex' },
  { id: 'smite_evil', name: 'Smite Evil', description: 'Channel divine power to damage undead and fiends', category: 'combat', stat: 'cha' },
  { id: 'divine_shield', name: 'Divine Shield', description: 'Create a protective barrier of holy energy', category: 'combat', stat: 'wis' },

  // Utility skills
  { id: 'stealth', name: 'Stealth', description: 'Move silently and avoid detection', category: 'utility', stat: 'dex' },
  { id: 'lockpicking', name: 'Lockpicking', description: 'Pick locks and disarm traps', category: 'utility', stat: 'dex' },
  { id: 'healing_word', name: 'Healing Word', description: 'Speak a word of power to mend wounds', category: 'utility', stat: 'wis' },
  { id: 'turn_undead', name: 'Turn Undead', description: 'Force undead creatures to flee or destroy them', category: 'utility', stat: 'cha' },
  { id: 'lay_on_hands', name: 'Lay on Hands', description: 'Channel healing energy through touch', category: 'utility', stat: 'cha' },
  { id: 'tracking', name: 'Tracking', description: 'Follow and read trails in the wilderness', category: 'utility', stat: 'wis' },
  { id: 'nature_sense', name: 'Nature Sense', description: 'Intuitive understanding of the natural world', category: 'utility', stat: 'wis' },

  // Social skills
  { id: 'persuasion', name: 'Persuasion', description: 'Influence others through charm and reasoning', category: 'social', stat: 'cha' },
  { id: 'deception', name: 'Deception', description: 'Mislead others through lies and misdirection', category: 'social', stat: 'cha' },
  { id: 'intimidation', name: 'Intimidation', description: 'Influence others through threats and forcefulness', category: 'social', stat: 'str' },
  { id: 'performance', name: 'Performance', description: 'Entertain and captivate an audience', category: 'social', stat: 'cha' },

  // Knowledge skills
  { id: 'arcana', name: 'Arcana', description: 'Knowledge of magic, spells, and magical creatures', category: 'knowledge', stat: 'int' },
  { id: 'history', name: 'History', description: 'Knowledge of historical events and ancient civilizations', category: 'knowledge', stat: 'int' },
  { id: 'investigation', name: 'Investigation', description: 'Ability to discover clues and uncover secrets', category: 'knowledge', stat: 'int' },
  { id: 'culture', name: 'Culture', description: 'Knowledge of customs, traditions, and etiquette', category: 'knowledge', stat: 'int' },
  { id: 'human_language', name: 'Human Language', description: 'Fluency in common human tongues', category: 'knowledge', stat: 'int' },
  { id: 'history_mountain', name: 'Mountain History', description: 'Knowledge of mountain realms and dwarven history', category: 'knowledge', stat: 'int' },
  { id: 'stonecraft', name: 'Stonecraft', description: 'Knowledge of stone, minerals, and construction', category: 'knowledge', stat: 'int' },

  // Survival skills
  { id: 'perception', name: 'Perception', description: 'Keen awareness of surroundings', category: 'survival', stat: 'wis' },
  { id: 'insight', name: 'Insight', description: 'Read intentions and detect deception', category: 'survival', stat: 'wis' },
  { id: 'medicine', name: 'Medicine', description: 'Treat injuries and diagnose diseases', category: 'survival', stat: 'wis' },
  { id: 'survival', name: 'Survival', description: 'Navigate and endure in the wilderness', category: 'survival', stat: 'wis' },
  { id: 'courage', name: 'Courage', description: 'Resist fear and face danger with resolve', category: 'survival', stat: 'con' },
  { id: 'luck', name: 'Luck', description: 'A mysterious force that bends fortune in your favor', category: 'survival', stat: 'cha' },
];

export function getSkillsByCategory() {
  const categories = {};
  ALL_SKILLS.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });
  return categories;
}

export function getSkillsForClassAndRace(classId, raceId) {
  const cls = CLASSES.find(c => c.id === classId);
  const race = RACES.find(r => r.id === raceId);
  if (!cls) return [];

  const skills = new Set([...cls.startingSkills]);
  if (race && race.bonusSkills) {
    race.bonusSkills.forEach(id => skills.add(id));
  }
  return ALL_SKILLS.filter(s => skills.has(s.id));
}


