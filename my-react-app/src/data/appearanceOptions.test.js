import { APPEARANCE_OPTIONS } from './appearanceOptions';

describe('data/appearanceOptions.js', () => {
  describe('APPEARANCE_OPTIONS', () => {
    it('should have all 5 appearance categories', () => {
      expect(APPEARANCE_OPTIONS).toHaveProperty('hairColor');
      expect(APPEARANCE_OPTIONS).toHaveProperty('skinTone');
      expect(APPEARANCE_OPTIONS).toHaveProperty('eyeColor');
      expect(APPEARANCE_OPTIONS).toHaveProperty('hairStyle');
      expect(APPEARANCE_OPTIONS).toHaveProperty('build');
    });

    it('should have 8 hair color options', () => {
      expect(APPEARANCE_OPTIONS.hairColor).toHaveLength(8);
      APPEARANCE_OPTIONS.hairColor.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('hex');
        expect(option.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have 6 skin tone options', () => {
      expect(APPEARANCE_OPTIONS.skinTone).toHaveLength(6);
      APPEARANCE_OPTIONS.skinTone.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('hex');
        expect(option.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have 8 eye color options', () => {
      expect(APPEARANCE_OPTIONS.eyeColor).toHaveLength(8);
      APPEARANCE_OPTIONS.eyeColor.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('hex');
        expect(option.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have 6 hair style options', () => {
      expect(APPEARANCE_OPTIONS.hairStyle).toHaveLength(6);
      APPEARANCE_OPTIONS.hairStyle.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      });
    });

    it('should have 5 build options', () => {
      expect(APPEARANCE_OPTIONS.build).toHaveLength(5);
      APPEARANCE_OPTIONS.build.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      });
    });

    it('should have unique IDs within each category', () => {
      ['hairColor', 'skinTone', 'eyeColor', 'hairStyle', 'build'].forEach(key => {
        const ids = APPEARANCE_OPTIONS[key].map(o => o.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      });
    });

    it('should have unique names within each category', () => {
      ['hairColor', 'skinTone', 'eyeColor', 'hairStyle', 'build'].forEach(key => {
        const names = APPEARANCE_OPTIONS[key].map(o => o.name);
        const unique = new Set(names);
        expect(unique.size).toBe(names.length);
      });
    });
  });
});
