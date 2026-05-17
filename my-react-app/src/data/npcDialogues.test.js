/**
 * Tests for NPC Dialogue Data Structures
 */

import {
  NPC_ID,
  TRIGGER,
  NPC_APPEARANCES,
  NPC_DATA,
  getNpcById,
  getNpcsForFloor,
  getMetDialogueSet,
} from './npcDialogues';

describe('NPC Data Structures', () => {
  describe('NPC_ID constants', () => {
    it('has all three NPC IDs', () => {
      expect(NPC_ID.MERCHANT).toBe('merchant');
      expect(NPC_ID.GUIDE).toBe('guide');
      expect(NPC_ID.WANDERER).toBe('wanderer');
    });
  });

  describe('TRIGGER constants', () => {
    it('has all trigger types', () => {
      expect(TRIGGER.FIRST_VISIT).toBe('FIRST_VISIT');
      expect(TRIGGER.FLOOR_COMPLETED).toBe('FLOOR_COMPLETED');
      expect(TRIGGER.LORE_FRAGMENTS).toBe('LORE_FRAGMENTS');
      expect(TRIGGER.TOWER1_COMPLETED).toBe('TOWER1_COMPLETED');
      expect(TRIGGER.ALWAYS).toBe('ALWAYS');
    });
  });

  describe('NPC_APPEARANCES', () => {
    it('has appearance data for all NPCs', () => {
      expect(NPC_APPEARANCES[NPC_ID.MERCHANT]).toBeDefined();
      expect(NPC_APPEARANCES[NPC_ID.GUIDE]).toBeDefined();
      expect(NPC_APPEARANCES[NPC_ID.WANDERER]).toBeDefined();
    });

    it('merchant has correct appearance properties', () => {
      const appearance = NPC_APPEARANCES[NPC_ID.MERCHANT];
      expect(appearance.primaryColor).toBe('#8b6914');
      expect(appearance.secondaryColor).toBe('#d4a017');
      expect(appearance.glowColor).toBe('#f0c040');
      expect(appearance.visualElements).toContain('patched_cloak');
      expect(appearance.visualElements).toContain('cart');
    });

    it('guide has correct appearance properties', () => {
      const appearance = NPC_APPEARANCES[NPC_ID.GUIDE];
      expect(appearance.primaryColor).toBe('#4a90d9');
      expect(appearance.secondaryColor).toBe('#a8d8ea');
      expect(appearance.glowColor).toBe('#ffe066');
      expect(appearance.visualElements).toContain('uniform');
      expect(appearance.visualElements).toContain('lantern');
    });

    it('wanderer has correct appearance properties', () => {
      const appearance = NPC_APPEARANCES[NPC_ID.WANDERER];
      expect(appearance.primaryColor).toBe('#1a1a2e');
      expect(appearance.secondaryColor).toBe('#2d1b4e');
      expect(appearance.glowColor).toBe('#a855f7');
      expect(appearance.visualElements).toContain('dark_cloak');
      expect(appearance.visualElements).toContain('glowing_eyes');
    });
  });

  describe('NPC_DATA', () => {
    it('has exactly 3 NPCs', () => {
      expect(NPC_DATA).toHaveLength(3);
    });

    it('each NPC has required fields', () => {
      NPC_DATA.forEach((npc) => {
        expect(npc.id).toBeDefined();
        expect(npc.name).toBeDefined();
        expect(npc.personality).toBeDefined();
        expect(npc.appearanceKey).toBeDefined();
        expect(npc.appearingFloors).toBeInstanceOf(Array);
        expect(npc.dialogues).toBeInstanceOf(Array);
        expect(npc.dialogues.length).toBeGreaterThan(0);
      });
    });

    it('merchant appears on floors 1, 3, 5', () => {
      const merchant = getNpcById(NPC_ID.MERCHANT);
      expect(merchant.appearingFloors).toEqual([1, 3, 5]);
    });

    it('guide appears on floors 2, 4', () => {
      const guide = getNpcById(NPC_ID.GUIDE);
      expect(guide.appearingFloors).toEqual([2, 4]);
    });

    it('wanderer appears on floor 3 only', () => {
      const wanderer = getNpcById(NPC_ID.WANDERER);
      expect(wanderer.appearingFloors).toEqual([3]);
    });

    it('each NPC has 5 dialogues', () => {
      NPC_DATA.forEach((npc) => {
        expect(npc.dialogues).toHaveLength(5);
      });
    });

    it('each dialogue has id, text, and trigger', () => {
      NPC_DATA.forEach((npc) => {
        npc.dialogues.forEach((dialogue) => {
          expect(dialogue.id).toBeDefined();
          expect(dialogue.text).toBeDefined();
          expect(dialogue.trigger).toBeDefined();
          expect(dialogue.trigger.type).toBeDefined();
        });
      });
    });

    it('dialogue IDs are unique', () => {
      const ids = NPC_DATA.flatMap((npc) =>
        npc.dialogues.map((d) => d.id)
      );
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getNpcById', () => {
    it('returns correct NPC for each ID', () => {
      expect(getNpcById(NPC_ID.MERCHANT).id).toBe(NPC_ID.MERCHANT);
      expect(getNpcById(NPC_ID.GUIDE).id).toBe(NPC_ID.GUIDE);
      expect(getNpcById(NPC_ID.WANDERER).id).toBe(NPC_ID.WANDERER);
    });

    it('returns undefined for unknown ID', () => {
      expect(getNpcById('unknown')).toBeUndefined();
    });
  });

  describe('getNpcsForFloor', () => {
    it('returns merchant and wanderer for floor 3', () => {
      const npcs = getNpcsForFloor(3);
      expect(npcs).toHaveLength(2);
      expect(npcs.find((n) => n.id === NPC_ID.MERCHANT)).toBeDefined();
      expect(npcs.find((n) => n.id === NPC_ID.WANDERER)).toBeDefined();
    });

    it('returns merchant only for floor 1', () => {
      const npcs = getNpcsForFloor(1);
      expect(npcs).toHaveLength(1);
      expect(npcs[0].id).toBe(NPC_ID.MERCHANT);
    });

    it('returns guide only for floor 2', () => {
      const npcs = getNpcsForFloor(2);
      expect(npcs).toHaveLength(1);
      expect(npcs[0].id).toBe(NPC_ID.GUIDE);
    });

    it('returns merchant and wanderer for floor 3', () => {
      const npcs = getNpcsForFloor(3);
      expect(npcs).toHaveLength(2);
      expect(npcs.find((n) => n.id === NPC_ID.MERCHANT)).toBeDefined();
      expect(npcs.find((n) => n.id === NPC_ID.WANDERER)).toBeDefined();
    });

    it('returns guide only for floor 4', () => {
      const npcs = getNpcsForFloor(4);
      expect(npcs).toHaveLength(1);
      expect(npcs[0].id).toBe(NPC_ID.GUIDE);
    });

    it('returns merchant for floor 5', () => {
      const npcs = getNpcsForFloor(5);
      expect(npcs).toHaveLength(1);
      expect(npcs[0].id).toBe(NPC_ID.MERCHANT);
    });

    it('returns empty array for non-existent floor', () => {
      expect(getNpcsForFloor(10)).toHaveLength(0);
    });
  });

  describe('getMetDialogueSet', () => {
    it('converts array to Set', () => {
      const set = getMetDialogueSet(['merchant_d1', 'merchant_d2']);
      expect(set).toBeInstanceOf(Set);
      expect(set.has('merchant_d1')).toBe(true);
      expect(set.has('merchant_d2')).toBe(true);
    });

    it('handles undefined input', () => {
      const set = getMetDialogueSet(undefined);
      expect(set).toBeInstanceOf(Set);
      expect(set.size).toBe(0);
    });

    it('handles null input', () => {
      const set = getMetDialogueSet(null);
      expect(set).toBeInstanceOf(Set);
      expect(set.size).toBe(0);
    });
  });
});
