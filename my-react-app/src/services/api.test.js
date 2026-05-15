import { api } from './api';

describe('services/api.js', () => {
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
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id).toMatch(/^char_/);

      const list = JSON.parse(localStorage.getItem('rpg_characters'));
      expect(list).toBeInstanceOf(Array);
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Test Hero');
      expect(list[0].class.id).toBe('warrior');
      expect(list[0].race.id).toBe('human');
      expect(list[0].stats.str).toBe(10);
      expect(Array.isArray(list[0].selectedSkillIds)).toBe(true);
      expect(list[0].selectedSkillIds).toContain('swordsmanship');
      expect(list[0].updatedAt).toBeDefined();
    });

    it('should overwrite existing saved character', async () => {
      const first = await api.saveCharacter({ name: 'First Hero', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });
      const second = await api.saveCharacter({ ...first, name: 'Second Hero', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });

      const list = JSON.parse(localStorage.getItem('rpg_characters'));
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Second Hero');
      expect(second.id).toBe(first.id);
    });

    it('should support multiple characters', async () => {
      await api.saveCharacter({ name: 'Hero One', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });
      await api.saveCharacter({ name: 'Hero Two', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });

      const list = JSON.parse(localStorage.getItem('rpg_characters'));
      expect(list.length).toBe(2);
      expect(list.some(c => c.name === 'Hero One')).toBe(true);
      expect(list.some(c => c.name === 'Hero Two')).toBe(true);
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
      localStorage.setItem('rpg_characters', 'invalid json');
      const result = await api.loadCharacter();
      expect(result).toBeNull();
    });
  });

  describe('deleteCharacter', () => {
    it('should remove a character from localStorage', async () => {
      const char1 = await api.saveCharacter({ name: 'Keep Me', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });
      await api.saveCharacter({ name: 'Delete Me', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });

      const result = await api.deleteCharacter(char1.id);
      expect(result.success).toBe(true);

      const list = JSON.parse(localStorage.getItem('rpg_characters'));
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Delete Me');
    });
  });

  describe('getSavedCharacters', () => {
    it('should return empty list when no characters exist', async () => {
      const result = await api.getSavedCharacters();
      expect(result).toEqual([]);
    });

    it('should return all saved characters', async () => {
      await api.saveCharacter({ name: 'Hero A', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });
      await api.saveCharacter({ name: 'Hero B', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });

      const result = await api.getSavedCharacters();
      expect(result.length).toBe(2);
    });
  });

  describe('clearCharacter', () => {
    it('should remove the current character reference', async () => {
      await api.saveCharacter({ name: 'To Keep', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: new Set() });
      const result = await api.clearCharacter();

      expect(result.success).toBe(true);
      expect(localStorage.getItem('rpg_current_character')).toBeNull();
    });

    it('should succeed even when no character exists', async () => {
      const result = await api.clearCharacter();
      expect(result.success).toBe(true);
    });
  });
});
