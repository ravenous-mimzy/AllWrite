/**
 * Character Manager
 * Handles creating, loading, saving, and managing characters
 */

class CharacterManager {
  constructor(projectManager) {
    this.projectManager = projectManager;
    this.characters = [];
    this.customFlags = [];
  }

  /**
   * Normalizes various flag id inputs to the canonical lowercase ids
   */
  normalizeFlagId(flagId) {
    if (!flagId) return 'secondary';
    const map = {
      Primary: 'primary',
      primary: 'primary',
      Secondary: 'secondary',
      secondary: 'secondary',
      Tertiary: 'tertiary',
      tertiary: 'tertiary'
    };
    return map[flagId] || flagId;
  }

  /**
   * Gets predefined importance flags
   * @returns {Array} Array of predefined flags
   */
  getPredefinedFlags() {
    return [
      { id: 'primary', name: 'Primary Character', color: '#e74c3c' },
      { id: 'secondary', name: 'Secondary Character', color: '#f39c12' },
      { id: 'tertiary', name: 'Tertiary Character', color: '#3498db' }
    ];
  }

  /**
   * Gets all flags (predefined + custom)
   * @returns {Array} All flags
   */
  getAllFlags() {
    return [...this.getPredefinedFlags(), ...this.customFlags];
  }

  /**
   * Creates a new custom flag
   * @param {string} name - Flag name
   * @param {string} color - Flag color (hex)
   * @returns {Object} The created flag
   */
  createCustomFlag(name, color = '#95a5a6') {
    const flag = {
      id: 'custom_' + Date.now(),
      name: name,
      color: color,
      isCustom: true
    };
    this.customFlags.push(flag);
    this.saveCharacterData();
    return flag;
  }

  /**
   * Creates a new character
   * @param {string} name - Character name
   * @param {string} flagId - Importance flag ID
   * @returns {Object} The created character
   */
  createCharacter(name, flagId = 'secondary') {
    const normalizedFlag = this.normalizeFlagId(flagId);
    const character = {
      id: 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: name,
      flagId: normalizedFlag,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      data: {
        gender: '',
        age: '',
        physicalDescription: '',
        personality: '',
        background: '',
        roleArchetype: '',
        relationships: '',
        notes: '',
        picture: null
      }
    };
    this.characters.push(character);
    this.saveCharacterData();
    return character;
  }

  /**
   * Gets a character by ID
   * @param {string} characterId - Character ID
   * @returns {Object} The character
   */
  getCharacter(characterId) {
    return this.characters.find((c) => c.id === characterId);
  }

  /**
   * Gets all characters
   * @returns {Array} All characters
   */
  getAllCharacters() {
    return this.characters;
  }

  /**
   * Gets characters filtered by flag
   * @param {string} flagId - Flag ID
   * @returns {Array} Filtered characters
   */
  getCharactersByFlag(flagId) {
    return this.characters.filter((c) => c.flagId === flagId);
  }

  /**
   * Updates a character
   * @param {string} characterId - Character ID
   * @param {Object} updates - Fields to update
   */
  updateCharacter(characterId, updates) {
    const character = this.getCharacter(characterId);
    if (!character) return;

    // Update allowed fields
    if (updates.name) character.name = updates.name;
    if (updates.flagId) character.flagId = updates.flagId;
    if (updates.data) character.data = { ...character.data, ...updates.data };

    character.lastModified = new Date().toISOString();
    this.saveCharacterData();
  }

  /**
   * Deletes a character
   * @param {string} characterId - Character ID
   */
  deleteCharacter(characterId) {
    this.characters = this.characters.filter((c) => c.id !== characterId);
    this.saveCharacterData();
  }

  /**
   * Saves all character data to app state
   */
  saveCharacterData() {
    // This will be saved via the main app's save mechanism
    if (window.electronAPI) {
      const appState = {
        characters: this.characters,
        customFlags: this.customFlags
      };
      // Store in a way that will be persisted
      window.characterManagerState = appState;
    }
  }

  /**
   * Loads character data from app state
   * @param {Object} data - Saved character data
   */
  loadCharacterData(data) {
    if (data && data.characters) {
      // Normalize any legacy mixed-case flag ids from saved state
      this.characters = data.characters.map((c) => ({
        ...c,
        flagId: this.normalizeFlagId(c.flagId)
      }));
    }
    if (data && data.customFlags) {
      this.customFlags = data.customFlags;
    }
  }

  /**
   * Searches characters by name
   * @param {string} query - Search query
   * @returns {Array} Matching characters
   */
  searchCharacters(query) {
    const lowerQuery = query.toLowerCase();
    return this.characters.filter((c) => c.name.toLowerCase().includes(lowerQuery));
  }

  /**
   * Gets character count
   * @returns {number} Number of characters
   */
  getCharacterCount() {
    return this.characters.length;
  }

  /**
   * Gets flag by ID
   * @param {string} flagId - Flag ID
   * @returns {Object} The flag
   */
  getFlagById(flagId) {
    return this.getAllFlags().find((f) => f.id === flagId);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterManager;
}
