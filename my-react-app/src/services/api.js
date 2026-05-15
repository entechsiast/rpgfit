const STORAGE_KEY = 'rpg_characters';
const CURRENT_KEY = 'rpg_current_character';

function getSavedList() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
  return `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const api = {
  async saveCharacter(character) {
    const list = getSavedList();
    const existingIndex = list.findIndex(c => c.id === character.id || c.id === character._id);

    const saveData = {
      ...character,
      selectedSkillIds: Array.from(character.selectedSkillIds),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = saveData;
    } else {
      saveData.id = generateId();
      saveData.createdAt = Date.now();
      list.push(saveData);
    }

    saveList(list);
    localStorage.setItem(CURRENT_KEY, saveData.id);

    return { success: true, id: saveData.id };
  },

  async loadCharacter() {
    const currentId = localStorage.getItem(CURRENT_KEY);
    const list = getSavedList();

    if (currentId) {
      const found = list.find(c => c.id === currentId);
      if (found) {
        return {
          ...found,
          selectedSkillIds: new Set(found.selectedSkillIds || []),
        };
      }
    }

    // Fallback to first saved character
    if (list.length > 0) {
      const first = list[0];
      localStorage.setItem(CURRENT_KEY, first.id);
      return {
        ...first,
        selectedSkillIds: new Set(first.selectedSkillIds || []),
      };
    }

    return null;
  },

  async deleteCharacter(id) {
    const list = getSavedList().filter(c => c.id !== id);
    saveList(list);
    if (localStorage.getItem(CURRENT_KEY) === id) {
      localStorage.removeItem(CURRENT_KEY);
    }
    return { success: true };
  },

  async loadCharacterById(id) {
    const list = getSavedList();
    const found = list.find(c => c.id === id);
    if (found) {
      localStorage.setItem(CURRENT_KEY, id);
      return {
        ...found,
        selectedSkillIds: new Set(found.selectedSkillIds || []),
      };
    }
    return null;
  },

  async getSavedCharacters() {
    return getSavedList();
  },

  async clearCharacter() {
    localStorage.removeItem(CURRENT_KEY);
    return { success: true };
  },
};
