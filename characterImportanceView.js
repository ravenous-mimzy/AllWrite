/**
 * Character Importance View
 * Displays characters grouped by their importance flags (Primary, Secondary, Tertiary, custom)
 */

class CharacterImportanceView {
  constructor(characterManager, sharedState) {
    this.characterManager = characterManager;
    this.searchQuery = '';

    // Use shared sort/filter state if provided so settings persist across views
    this.sortBy = (sharedState && sharedState.sortBy) || 'name-asc';
    this.filterBy = 'all'; // legacy, not used for buttons but kept for compatibility
    this.importanceFilter = (sharedState && sharedState.importanceFilter)
      ? { ...sharedState.importanceFilter }
      : { primary: true, secondary: true, tertiary: true };
    this.genderFilter = (sharedState && sharedState.genderFilter)
      ? { ...sharedState.genderFilter }
      : { male: true, female: true, other: true };

    this.sharedState = sharedState || null;
  }

  /**
   * Renders the importance view
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'character-importance-view';

    // Header with title and buttons
    const header = this.renderHeader();
    container.appendChild(header);

    // Search bar
    const searchBar = this.renderSearchBar();
    container.appendChild(searchBar);

    // View switcher
    const viewSwitcher = this.renderViewSwitcher();
    container.appendChild(viewSwitcher);

    // Filter / sort bar
    const filterBar = this.renderFilterBar();
    container.appendChild(filterBar);

    // Importance groups container
    const groupsContainer = document.createElement('div');
    groupsContainer.className = 'character-importance-groups';
    groupsContainer.id = 'character-importance-groups';
    
    this.renderImportanceGroups(groupsContainer);
    container.appendChild(groupsContainer);

    return container;
  }

  /**
   * Renders the header with title and add button
   * @returns {HTMLElement}
   */
  renderHeader() {
    const header = document.createElement('div');
    header.className = 'character-list-header';

    const title = document.createElement('h3');
    title.textContent = 'Characters';

    const addBtn = document.createElement('button');
    addBtn.className = 'character-add-btn';
    addBtn.textContent = '+ Add Character';
    addBtn.addEventListener('click', () => this.onAddCharacter());

    header.appendChild(title);
    header.appendChild(addBtn);

    return header;
  }

  /**
   * Renders the search bar
   * @returns {HTMLElement}
   */
  renderSearchBar() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'character-search-bar';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search characters...';
    input.className = 'character-search-input';
    input.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateImportanceGroups();
    });

    searchContainer.appendChild(input);
    return searchContainer;
  }

  /**
   * Renders the view switcher buttons
   * @returns {HTMLElement}
   */
  renderViewSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'character-view-switcher';

    const views = [
      { id: 'list', label: '📋 List', title: 'List View' },
      { id: 'card', label: '🗂️ Cards', title: 'Card View' },
      { id: 'importance', label: '⭐ Importance', title: 'Importance View' }
    ];

    views.forEach((view) => {
      const btn = document.createElement('button');
      btn.className = 'character-view-btn';
      btn.textContent = view.label;
      btn.title = view.title;
      
      if (view.id === 'importance') {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('switchCharacterView', {
          detail: { view: view.id }
        }));
      });

      switcher.appendChild(btn);
    });

    return switcher;
  }

  /**
   * Renders the filter/sort bar with button controls
   * @returns {HTMLElement}
   */
  renderFilterBar() {
    const bar = document.createElement('div');
    bar.className = 'character-filter-bar';

    // Sort buttons
    const sortGroup = document.createElement('div');
    sortGroup.className = 'character-filter-group';

    const sortLabel = document.createElement('span');
    sortLabel.className = 'character-filter-label';
    sortLabel.textContent = 'Sort:';
    sortGroup.appendChild(sortLabel);

    const sorts = [
      { id: 'name-asc', label: 'A · Z' },
      { id: 'name-desc', label: 'Z · A' }
    ];

    sorts.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'character-filter-btn';
      if (this.sortBy === opt.id) {
        btn.classList.add('active');
      }
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (this.sortBy !== opt.id) {
          this.sortBy = opt.id;
          if (this.sharedState) {
            this.sharedState.sortBy = this.sortBy;
          }
          // Update visual active state
          Array.from(sortGroup.querySelectorAll('.character-filter-btn')).forEach((b) =>
            b.classList.remove('active')
          );
          btn.classList.add('active');
          this.updateImportanceGroups();
        }
      });
      sortGroup.appendChild(btn);
    });

    // Filter buttons (toggle-able)
    const filterGroup = document.createElement('div');
    filterGroup.className = 'character-filter-group';

    const filterLabel = document.createElement('span');
    filterLabel.className = 'character-filter-label';
    filterLabel.textContent = 'Filter:';
    filterGroup.appendChild(filterLabel);

    // Importance filters (Primary / Secondary / Tertiary)
    const importanceFilters = [
      { id: 'primary', label: 'Primary' },
      { id: 'secondary', label: 'Secondary' },
      { id: 'tertiary', label: 'Tertiary' }
    ];

    importanceFilters.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'character-filter-btn';
      if (this.importanceFilter && this.importanceFilter[opt.id]) {
        btn.classList.add('active');
      }
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (!this.importanceFilter) {
          this.importanceFilter = { primary: true, secondary: true, tertiary: true };
        }
        this.importanceFilter[opt.id] = !this.importanceFilter[opt.id];
        if (this.sharedState) {
          this.sharedState.importanceFilter = { ...this.importanceFilter };
        }
        if (this.importanceFilter[opt.id]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        this.updateImportanceGroups();
      });
      filterGroup.appendChild(btn);
    });

    // Gender filters (Male / Female / Other/Unspecified)
    const genderFilters = [
      { id: 'male', label: '♂️ Male' },
      { id: 'female', label: '♀️ Female' },
      { id: 'other', label: '⚪ Other' }
    ];

    genderFilters.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'character-filter-btn';
      if (this.genderFilter && this.genderFilter[opt.id]) {
        btn.classList.add('active');
      }
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (!this.genderFilter) {
          this.genderFilter = { male: true, female: true, other: true };
        }
        this.genderFilter[opt.id] = !this.genderFilter[opt.id];
        if (this.sharedState) {
          this.sharedState.genderFilter = { ...this.genderFilter };
        }
        if (this.genderFilter[opt.id]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        this.updateImportanceGroups();
      });
      filterGroup.appendChild(btn);
    });

    bar.appendChild(sortGroup);
    bar.appendChild(filterGroup);

    return bar;
  }

  /**
   * Renders importance groups
   * @param {HTMLElement} container
   */
  renderImportanceGroups(container) {
    const flags = this.characterManager.getAllFlags();
    
    flags.forEach((flag) => {
      let characters = this.characterManager.getCharactersByFlag(flag.id);

      // Apply search
      characters = characters.filter((c) => 
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      
      // Apply importance filtering (if any importance buttons are active)
      if (this.importanceFilter && Object.values(this.importanceFilter).some(Boolean)) {
        const activeImportanceIds = Object.keys(this.importanceFilter).filter((key) => this.importanceFilter[key]);
        characters = characters.filter((c) => activeImportanceIds.includes(c.flagId));
      }

      // Apply gender filtering (if any gender buttons are active)
      if (this.genderFilter && Object.values(this.genderFilter).some(Boolean)) {
        characters = characters.filter((c) => {
          const gender = (c.data && c.data.gender) || '';
          const normalized = gender.toLowerCase();
          if (normalized === 'male') {
            return !!this.genderFilter.male;
          } else if (normalized === 'female') {
            return !!this.genderFilter.female;
          }
          return !!this.genderFilter.other;
        });
      }

      // Apply sort within group
      if (this.sortBy === 'name-asc') {
        characters.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === 'name-desc') {
        characters.sort((a, b) => b.name.localeCompare(a.name));
      }

      if (characters.length === 0 && this.searchQuery === '') {
        // Still show empty groups when not searching
      } else if (characters.length === 0) {
        // Hide empty groups when searching
        return;
      }

      const group = this.renderFlagGroup(flag, characters);
      container.appendChild(group);
    });
  }

  /**
   * Renders a single importance group
   * @param {Object} flag - The flag object
   * @param {Array} characters - Characters with this flag
   * @returns {HTMLElement}
   */
  renderFlagGroup(flag, characters) {
    const group = document.createElement('div');
    group.className = 'character-importance-group';

    // Group header
    const header = document.createElement('div');
    header.className = 'character-group-header';
    header.style.borderLeftColor = flag.color;

    const badge = document.createElement('span');
    badge.className = 'character-group-badge';
    badge.style.backgroundColor = flag.color;
    badge.textContent = flag.name;

    const count = document.createElement('span');
    count.className = 'character-group-count';
    count.textContent = `(${characters.length})`;

    header.appendChild(badge);
    header.appendChild(count);
    group.appendChild(header);

    // Characters in this group
    const charactersList = document.createElement('div');
    charactersList.className = 'character-group-list';

    if (characters.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'character-group-empty';
      empty.textContent = 'No characters';
      charactersList.appendChild(empty);
    } else {
      characters.forEach((character) => {
        const item = this.renderCharacterItem(character);
        charactersList.appendChild(item);
      });
    }

    group.appendChild(charactersList);
    return group;
  }

  /**
   * Renders a single character item as a compact card
   * @param {Object} character
   * @returns {HTMLElement}
   */
  renderCharacterItem(character) {
    const item = document.createElement('div');
    item.className = 'character-importance-card';

    // Name header
    const nameHeader = document.createElement('div');
    nameHeader.className = 'character-card-name-header';
    nameHeader.textContent = character.name;
    nameHeader.addEventListener('click', () => {
      const event = new CustomEvent('characterSelected', {
        detail: { character }
      });
      document.dispatchEvent(event);
    });

    // Picture area
    const pictureArea = document.createElement('div');
    pictureArea.className = 'character-card-picture';
    if (character.data.picture) {
      const img = document.createElement('img');
      img.src = character.data.picture;
      pictureArea.appendChild(img);
    } else {
      pictureArea.innerHTML = '📷';
    }

    // Gender and age row
    const detailsRow = document.createElement('div');
    detailsRow.className = 'character-card-details-row';

    const genderSymbol = document.createElement('span');
    genderSymbol.className = 'character-card-gender';
    if (character.data.gender) {
      genderSymbol.textContent = character.data.gender === 'Male' ? '♂️' : 
                                  character.data.gender === 'Female' ? '♀️' : '⚪';
    } else {
      genderSymbol.textContent = '⚪';
    }

    const ageText = document.createElement('span');
    ageText.className = 'character-card-age';
    ageText.textContent = character.data.age ? `Age: ${character.data.age}` : 'Age: -';

    detailsRow.appendChild(genderSymbol);
    detailsRow.appendChild(ageText);

    // Actions row
    const actionsRow = document.createElement('div');
    actionsRow.className = 'character-card-actions-row';

    const editBtn = document.createElement('button');
    editBtn.className = 'character-edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit character';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const event = new CustomEvent('characterSelected', {
        detail: { character }
      });
      document.dispatchEvent(event);
    });

    const exportBtn = document.createElement('button');
    exportBtn.className = 'character-export-btn';
    exportBtn.textContent = '📤';
    exportBtn.title = 'Export character';
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onExportCharacter(character);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'character-delete-btn';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Delete character';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onDeleteCharacter(character.id, character.name);
    });

    actionsRow.appendChild(editBtn);
    actionsRow.appendChild(exportBtn);
    actionsRow.appendChild(deleteBtn);

    // Assemble card
    item.appendChild(nameHeader);
    item.appendChild(pictureArea);
    item.appendChild(detailsRow);
    item.appendChild(actionsRow);

    return item;
  }

  /**
   * Updates the importance groups display
   */
  updateImportanceGroups() {
    const container = document.getElementById('character-importance-groups');
    if (container) {
      container.innerHTML = '';
      this.renderImportanceGroups(container);
    }
  }

  /**
   * Handles add character
   */
  onAddCharacter() {
    document.dispatchEvent(new CustomEvent('addCharacter'));
  }

  /**
   * Handles delete character
   */
  onDeleteCharacter(characterId, characterName) {
    if (confirm(`Delete character "${characterName}"?`)) {
      this.characterManager.deleteCharacter(characterId);
      this.updateImportanceGroups();
      document.dispatchEvent(new CustomEvent('characterDeleted'));
    }
  }

  /**
   * Handles export character
   */
  onExportCharacter(character) {
    console.log('Exporting character:', character);
    alert(`Export feature coming soon for "${character.name}"`);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterImportanceView;
}
