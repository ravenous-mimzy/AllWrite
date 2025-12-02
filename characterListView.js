/**
 * Character List View
 * Displays characters in a list format with search, filter, and actions
 */

class CharacterListView {
  constructor(characterManager, sharedState) {
    this.characterManager = characterManager;
    this.searchQuery = '';
    this.currentView = 'list'; // 'list', 'card', 'importance'

    // Use shared sort/filter state if provided so settings persist across views
    this.sortBy = (sharedState && sharedState.sortBy) || 'name-asc'; // 'name-asc', 'name-desc'
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
   * Renders the character list view
   * @returns {HTMLElement} The rendered view
   */
  render() {
    const container = document.createElement('div');
    container.className = 'character-list-view';

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

    // Character list
    const listContainer = document.createElement('div');
    listContainer.className = 'character-list-container';
    listContainer.id = 'character-list-container';
    
    this.renderCharacterList(listContainer);
    container.appendChild(listContainer);

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
      this.updateCharacterList();
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
      if (view.id === this.currentView) {
        btn.classList.add('active');
      }
      btn.textContent = view.label;
      btn.title = view.title;
      btn.addEventListener('click', () => {
        const event = new CustomEvent('switchCharacterView', {
          detail: { view: view.id }
        });
        document.dispatchEvent(event);
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
          this.updateCharacterList();
        }
      });
      sortGroup.appendChild(btn);
    });

    // Filter buttons: importance and gender toggles
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
        // Update visual state
        if (this.importanceFilter[opt.id]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        this.updateCharacterList();
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
        // Update visual state
        if (this.genderFilter[opt.id]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        this.updateCharacterList();
      });
      filterGroup.appendChild(btn);
    });

    bar.appendChild(sortGroup);
    bar.appendChild(filterGroup);

    return bar;
  }

  /**
   * Renders the character list
   * @param {HTMLElement} container - Container to render into
   */
  renderCharacterList(container) {
    container.innerHTML = '';

    let characters;
    if (this.searchQuery) {
      characters = this.characterManager.searchCharacters(this.searchQuery);
    } else {
      characters = this.characterManager.getAllCharacters();
    }

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
        // Anything else (including empty) counts as other/unspecified
        return !!this.genderFilter.other;
      });
    }

    // Apply sorting
    if (this.sortBy === 'name-asc') {
      characters.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'name-desc') {
      characters.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (characters.length === 0) {
      const noCharacters = document.createElement('p');
      noCharacters.className = 'character-list-empty';
      noCharacters.textContent = this.searchQuery
        ? 'No characters found'
        : 'No characters yet. Click "Add Character" to create one!';
      container.appendChild(noCharacters);
      return;
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'character-list-table';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Name', 'Gender', 'Importance', 'Age', 'Actions'];
    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    characters.forEach((character) => {
      const row = document.createElement('tr');
      row.className = 'character-list-row';

      // Name cell (clickable)
      const nameCell = document.createElement('td');
      nameCell.className = 'character-list-name';
      nameCell.textContent = character.name;
      nameCell.addEventListener('click', () => {
        // Dispatch event so app.js can handle it
        const event = new CustomEvent('characterSelected', {
          detail: { character }
        });
        document.dispatchEvent(event);
      });
      row.appendChild(nameCell);

      // Gender cell
      const genderCell = document.createElement('td');
      if (character.data.gender) {
        genderCell.textContent = character.data.gender === 'Male' ? '♂️' : 
                                 character.data.gender === 'Female' ? '♀️' : '⚪';
      } else {
        genderCell.textContent = '⚪';
      }
      row.appendChild(genderCell);

      // Importance cell
      const importanceCell = document.createElement('td');
      const flag = this.characterManager.getFlagById(character.flagId);
      const flagBadge = document.createElement('span');
      flagBadge.className = 'character-flag-badge';
      flagBadge.style.backgroundColor = flag ? flag.color : '#95a5a6';
      flagBadge.textContent = flag ? flag.name : 'Unknown';
      importanceCell.appendChild(flagBadge);
      row.appendChild(importanceCell);

      // Age cell
      const ageCell = document.createElement('td');
      ageCell.textContent = character.data.age || '-';
      row.appendChild(ageCell);

      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'character-list-actions';

      // Edit button
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

      // Export button
      const exportBtn = document.createElement('button');
      exportBtn.className = 'character-export-btn';
      exportBtn.textContent = '📤';
      exportBtn.title = 'Export character';
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onExportCharacter(character);
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'character-delete-btn';
      deleteBtn.textContent = '🗑';
      deleteBtn.title = 'Delete character';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDeleteCharacter(character.id, character.name);
      });

      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(exportBtn);
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  /**
   * Updates the character list display
   */
  updateCharacterList() {
    const container = document.getElementById('character-list-container');
    if (container) {
      this.renderCharacterList(container);
    }
  }

  /**
   * Updates the view switcher buttons
   */
  updateViewSwitcher() {
    document.querySelectorAll('.character-view-btn').forEach((btn, index) => {
      btn.classList.remove('active');
      const views = ['list', 'card', 'importance'];
      if (views[index] === this.currentView) {
        btn.classList.add('active');
      }
    });
  }

  /**
   * Handles add character
   */
  onAddCharacter() {
    // Trigger event that app will handle
    document.dispatchEvent(new CustomEvent('addCharacter'));
  }

  /**
   * Handles delete character
   */
  onDeleteCharacter(characterId, characterName) {
    if (confirm(`Delete character "${characterName}"?`)) {
      this.characterManager.deleteCharacter(characterId);
      this.updateCharacterList();
      document.dispatchEvent(new CustomEvent('characterDeleted'));
    }
  }

  /**
   * Handles export character
   */
  onExportCharacter(character) {
    // For now, just log it - can be enhanced later for cross-project export
    console.log('Exporting character:', character);
    // Future: Show export dialog or send to another project
    alert(`Export feature coming soon for "${character.name}"`);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterListView;
}
