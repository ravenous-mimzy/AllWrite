/**
 * Character Editor Panel
 * Displays and allows editing of character details
 */

class CharacterEditorPanel {
  constructor(characterManager) {
    this.characterManager = characterManager;
    this.currentCharacterId = null;
  }

  /**
   * Renders the character editor panel
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'character-editor-panel';
    container.id = 'character-editor-container';

    return container;
  }

  /**
   * Renders a save status indicator
   * @returns {HTMLElement}
   */
  renderSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'character-save-indicator';
    indicator.id = 'character-save-indicator';
    indicator.textContent = 'Saving...';
    indicator.style.opacity = '0';
    return indicator;
  }

  /**
   * Loads a character for editing
   * @param {string} characterId - Character ID
   */
  loadCharacter(characterId) {
    this.currentCharacterId = characterId;
    const character = this.characterManager.getCharacter(characterId);
    if (!character) return;

    const container = document.getElementById('character-editor-container');
    const panel = document.getElementById('character-editor');
    if (!container || !panel) return;

    container.innerHTML = '';
    container.classList.add('loaded');
    panel.classList.add('loaded');

    const form = this.renderCharacterForm(character);
    container.appendChild(form);
  }

  /**
   * Renders the character form
   * @param {Object} character - Character object
   * @returns {HTMLElement}
   */
  renderCharacterForm(character) {
    const form = document.createElement('form');
    form.className = 'character-editor-form';

    // Header with title and save indicator
    const header = document.createElement('div');
    header.className = 'character-editor-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Character Details';
    header.appendChild(title);

    const saveIndicator = document.createElement('div');
    saveIndicator.className = 'character-save-indicator';
    saveIndicator.id = 'character-save-indicator';
    saveIndicator.textContent = '✓ Saved';
    saveIndicator.style.fontSize = '12px';
    saveIndicator.style.color = '#27ae60';
    saveIndicator.style.marginLeft = 'auto';
    header.appendChild(saveIndicator);

    form.appendChild(header);

    // Form fields
    const fields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'gender', label: 'Gender', type: 'text' },
      { name: 'age', label: 'Age', type: 'text' },
      { name: 'roleArchetype', label: 'Role/Archetype', type: 'text' },
      { name: 'physicalDescription', label: 'Physical Description', type: 'textarea' },
      { name: 'personality', label: 'Personality', type: 'textarea' },
      { name: 'background', label: 'Background/History', type: 'textarea' },
      { name: 'relationships', label: 'Relationships', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' }
    ];

    fields.forEach((field) => {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'character-editor-field-group';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.className = 'character-editor-label';

      let input;
      const value = field.name === 'name' ? character.name : character.data[field.name];

      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.value = value || '';
        input.rows = 4;
      } else {
        input = document.createElement('input');
        input.type = field.type;
        input.value = value || '';
      }

      input.name = field.name;
      input.className = 'character-editor-input';

      // Save on both change and blur events
      input.addEventListener('blur', () => {
        this.saveCharacter();
      });

      // Also save on change for selects
      if (field.type !== 'textarea' && field.type !== 'text') {
        input.addEventListener('change', () => {
          this.saveCharacter();
        });
      }

      fieldGroup.appendChild(label);
      fieldGroup.appendChild(input);
      form.appendChild(fieldGroup);
    });

    // Flag selector
    const flagGroup = document.createElement('div');
    flagGroup.className = 'character-editor-field-group';

    const flagLabel = document.createElement('label');
    flagLabel.textContent = 'Importance';
    flagLabel.className = 'character-editor-label';

    const flagSelect = document.createElement('select');
    flagSelect.name = 'flagId';
    flagSelect.className = 'character-editor-select';

    this.characterManager.getAllFlags().forEach((flag) => {
      const option = document.createElement('option');
      option.value = flag.id;
      option.textContent = flag.name;
      if (flag.id === character.flagId) {
        option.selected = true;
      }
      flagSelect.appendChild(option);
    });

    flagSelect.addEventListener('change', () => {
      this.saveCharacter();
    });

    flagGroup.appendChild(flagLabel);
    flagGroup.appendChild(flagSelect);
    form.appendChild(flagGroup);

    return form;
  }

  /**
   * Saves the current character
   */
  saveCharacter() {
    if (!this.currentCharacterId) return;

    const form = document.querySelector('.character-editor-form');
    if (!form) return;

    const updates = {
      name: form.querySelector('input[name="name"]')?.value || '',
      flagId: form.querySelector('select[name="flagId"]')?.value || 'Primary',
      data: {
        gender: form.querySelector('input[name="gender"]')?.value || '',
        age: form.querySelector('input[name="age"]')?.value || '',
        roleArchetype: form.querySelector('input[name="roleArchetype"]')?.value || '',
        physicalDescription: form.querySelector('textarea[name="physicalDescription"]')?.value || '',
        personality: form.querySelector('textarea[name="personality"]')?.value || '',
        background: form.querySelector('textarea[name="background"]')?.value || '',
        relationships: form.querySelector('textarea[name="relationships"]')?.value || '',
        notes: form.querySelector('textarea[name="notes"]')?.value || ''
      }
    };

    this.characterManager.updateCharacter(this.currentCharacterId, updates);

    // Show save feedback
    const indicator = document.getElementById('character-save-indicator');
    if (indicator) {
      indicator.textContent = '✓ Saved';
      indicator.style.color = '#27ae60';
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        indicator.style.opacity = '0.5';
      }, 2000);
    }

    document.dispatchEvent(new CustomEvent('characterUpdated'));
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterEditorPanel;
}
