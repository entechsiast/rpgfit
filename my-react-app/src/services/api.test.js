import { api } from './api';

describe('services/api.js', () => {
  const TEST_KEY = 'rpg_character';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveCharacter', () => {
    it('should save character data to localStorage', async () => {
      const character = {
        name: 'Test Hero',
        class: { id: 'warrior', name: 'Warrior' },
        race: { id: 'human', name: 'Human' },
        stats: { str: 10, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
        pointsRemaining: 22,
        appearance: { hairColor: 'brown', skinTone: 'fair', eyeColor: 'brown', hairStyle: 'short', build: 'average' },
        selectedSkillIds: new Set(['swordsmanship']),
      };

      const result = await api.saveCharacter(character);

      expect(result.success).toBe(true);
      expect(result.id).toBe(TEST_KEY);

      const stored = JSON.parse(localStorage.getItem(TEST_KEY));
      expect(stored.name).toBe('Test Hero');
      expect(stored.class.id).toBe('warrior');
      expect(stored.race.id).toBe('human');
      expect(stored.stats.str).toBe(10);
      expect(Array.isArray(stored.selectedSkillIds)).toBe(true);
      expect(stored.selectedSkillIds).toContain('swordsmanship');
      expect(stored.timestamp).toBeDefined();
    });

    it('should overwrite existing saved character', async () => {
      await api.saveCharacter({ name: 'First Hero', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: [] });
      await api.saveCharacter({ name: 'Second Hero', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: [] });

      const stored = JSON.parse(localStorage.getItem(TEST_KEY));
      expect(stored.name).toBe('Second Hero');
    });
  });

  describe('loadCharacter', () => {
    it('should return null when no character is saved', async () => {
      const result = await api.loadCharacter();
      expect(result).toBeNull();
    });

    it('should return the saved character when one exists', async () => {
      const character = {
        name: 'Loaded Hero',
        class: { id: 'mage', name: 'Mage' },
        race: { id: 'elf', name: 'Elf' },
        stats: { str: 8, dex: 10, con: 8, int: 9, wis: 8, cha: 8 },
        pointsRemaining: 22,
        appearance: { hairColor: 'blonde', skinTone: 'pale', eyeColor: 'blue', hairStyle: 'long', build: 'slim' },
        selectedSkillIds: new Set(['fireball', 'arcana']),
      };

      await api.saveCharacter(character);
      const result = await api.loadCharacter();

      expect(result).not.toBeNull();
      expect(result.name).toBe('Loaded Hero');
      expect(result.class.id).toBe('mage');
      expect(result.race.id).toBe('elf');
      expect(result.stats.dex).toBe(10);
      expect(result.selectedSkillIds).toBeInstanceOf(Set);
      expect(result.selectedSkillIds.has('fireball')).toBe(true);
      expect(result.selectedSkillIds.has('arcana')).toBe(true);
    });

    it('should return null for corrupted data', async () => {
      localStorage.setItem(TEST_KEY, 'invalid json');
      const result = await api.loadCharacter();
      expect(result).toBeNull();
    });
  });

  describe('clearCharacter', () => {
    it('should remove the saved character from localStorage', async () => {
      await api.saveCharacter({ name: 'To Be Deleted', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: [] });
      const result = await api.clearCharacter();

      expect(result.success).toBe(true);
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });

    it('should succeed even when no character exists', async () => {
      const result = await api.clearCharacter();
      expect(result.success).toBe(true);
    });
  });
});
