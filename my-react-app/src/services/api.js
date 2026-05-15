const STORAGE_KEY = 'rpg_character';

export const api = {
  saveCharacter(character) {
    const data = {
      ...character,
      selectedSkillIds: Array.from(character.selectedSkillIds),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return Promise.resolve({ success: true, id: STORAGE_KEY });
  },

  loadCharacter() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return Promise.resolve(null);
    try {
      const parsed = JSON.parse(data);
      return Promise.resolve({
        ...parsed,
        selectedSkillIds: new Set(parsed.selectedSkillIds || []),
      });
    } catch {
      return Promise.resolve(null);
    }
  },

  clearCharacter() {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve({ success: true });
  },
};
