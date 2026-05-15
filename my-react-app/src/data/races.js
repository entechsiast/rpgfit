export const RACES = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and ambitious, humans adapt to any environment and excel in many pursuits.',
    statModifiers: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    bonusSkills: ['culture', 'human_language'],
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and long-lived, elves possess a deep connection to magic and the natural world.',
    statModifiers: { dex: 2, int: 1 },
    bonusSkills: ['arcana', 'perception'],
    speed: 35,
    size: 'Medium',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Sturdy and resilient, dwarves are skilled miners, warriors, and craftsmen who dwell in mountains.',
    statModifiers: { con: 2, str: 1 },
    bonusSkills: ['history_mountain', 'stonecraft'],
    speed: 25,
    size: 'Medium',
  },
  {
    id: 'half_elf',
    name: 'Half-Elf',
    description: 'Part human, part elf, half-elves inherit the adaptability of humans and the grace of elves.',
    statModifiers: { cha: 2, oneOther: true },
    bonusSkills: ['persuasion', 'perception'],
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small but courageous, halflings are nimble and lucky, known for their resilience against adversity.',
    statModifiers: { dex: 2, con: 1 },
    bonusSkills: ['luck', 'courage'],
    speed: 25,
    size: 'Small',
  },
  {
    id: 'orc',
    name: 'Orc',
    description: 'Fierce and powerful, orcs are born warriors who value strength and honor above all.',
    statModifiers: { str: 2, con: 1 },
    bonusSkills: ['intimidation', 'survival'],
    speed: 30,
    size: 'Medium',
  },
];

export function getRaceById(id) {
  return RACES.find(r => r.id === id);
}
