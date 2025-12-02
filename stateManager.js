/**
 * State Manager
 * Handles saving and loading of user preferences and panel layouts
 */

const fs = require('fs');
const path = require('path');

class StateManager {
  constructor() {
    this.stateFile = path.join(require('os').homedir(), '.writersApp', 'appState.json');
    this.ensureStateDirectory();
  }

  /**
   * Ensures the state directory exists
   */
  ensureStateDirectory() {
    const dir = path.dirname(this.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Saves the current app state (active section, panel positions, etc.)
   * @param {Object} state - The state object to save
   */
  saveState(state) {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
      console.log('State saved successfully');
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  /**
   * Loads the saved app state
   * @returns {Object} The saved state, or null if no state exists
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
    return null;
  }

  /**
   * Gets the default app state
   * @returns {Object} Default state object
   */
  getDefaultState() {
    return {
      currentSection: 'writing',
      panelLayouts: {}
    };
  }
}

module.exports = StateManager;
