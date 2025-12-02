/**
 * Character Card View
 * Displays characters as sticky-note style cards
 */

class CharacterCardView {
  constructor(characterManager, sharedState) {
    this.characterManager = characterManager;
    this.searchQuery = '';
    this.currentView = 'card'; // 'list', 'card', 'importance'

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
   * Renders the character card view
   * @returns {HTMLElement} The rendered view
   */
  render() {
    const container = document.createElement('div');
    container.className = 'character-card-view';

    // Header with title and buttons
    const header = this.renderHeader();
    container.appendChild(header);

    // Search bar
    const searchBar = this.renderSearchBar();
    container.appendChild(searchBar);

    // View switcher
    const viewSwitcher = this.renderViewSwitcher();
    container.appendChild(viewSwitcher);

    // Filter bar
    const filterBar = this.renderFilterBar();
    container.appendChild(filterBar);

    // Cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'character-cards-container';
    cardsContainer.id = 'character-cards-container';
    
    this.renderCharacterCards(cardsContainer);
    container.appendChild(cardsContainer);

    return container;
  }

  /**
   * Renders the header with title and add button
   * @returns {HTMLElement}
   */
  renderHeader() {
    const header = document.createElement('div');
    header.className = 'character-card-header';

    const title = document.createElement('h3');
    title.textContent = 'Characters';
    header.appendChild(title);

    const addBtn = document.createElement('button');
    addBtn.className = 'character-add-btn';
    addBtn.textContent = '+ Add Character';
    addBtn.addEventListener('click', () => this.onAddCharacter());
    header.appendChild(addBtn);

    return header;
  }

  /**
   * Renders the search bar
   * @returns {HTMLElement}
   */
  renderSearchBar() {
    const searchBar = document.createElement('div');
    searchBar.className = 'character-search-bar';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'character-search-input';
    input.placeholder = 'Search characters...';
    input.value = this.searchQuery;
    input.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateCharacterCards();
    });

    searchBar.appendChild(input);
    return searchBar;
  }

  /**
   * Renders the view switcher
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
          this.updateCharacterCards();
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
        this.updateCharacterCards();
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
        this.updateCharacterCards();
      });
      filterGroup.appendChild(btn);
    });

    bar.appendChild(sortGroup);
    bar.appendChild(filterGroup);

    return bar;
  }

  /**
   * Creates a single character card
   * @param {Object} character - Character object
   * @returns {HTMLElement}
   */
  createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.setAttribute('data-character-id', character.id);

    // Get flag for color coding
    const flag = this.characterManager.getFlagById(character.flagId);
    const flagColor = flag ? flag.color : '#95a5a6';
    card.style.borderTopColor = flagColor;

    // Card header with name
    const nameSection = document.createElement('div');
    nameSection.className = 'character-card-name-section';

    const name = document.createElement('h4');
    name.className = 'character-card-name';
    name.textContent = character.name;
    name.addEventListener('click', () => {
      const event = new CustomEvent('characterSelected', {
        detail: { character }
      });
      document.dispatchEvent(event);
    });
    nameSection.appendChild(name);

    // Flag badge
    const flagBadge = document.createElement('span');
    flagBadge.className = 'character-card-flag-badge';
    flagBadge.style.backgroundColor = flagColor;
    flagBadge.textContent = flag ? flag.name : 'Unknown';
    nameSection.appendChild(flagBadge);

    card.appendChild(nameSection);

    // Picture placeholder
    const pictureSection = document.createElement('div');
    pictureSection.className = 'character-card-picture';
    
    if (character.data.picture) {
      const img = document.createElement('img');
      img.src = character.data.picture;
      img.alt = character.name;
      pictureSection.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'character-card-picture-placeholder';
      placeholder.textContent = '🖼️';
      pictureSection.appendChild(placeholder);
    }
    card.appendChild(pictureSection);

    // Gender and age row (centered below picture)
    const genderAgeRow = document.createElement('div');
    genderAgeRow.className = 'character-card-gender-age-row';

    const genderSymbol = document.createElement('span');
    genderSymbol.className = 'character-card-gender-symbol';
    if (character.data.gender) {
      genderSymbol.textContent = character.data.gender === 'Male' ? '♂️' : 
                                 character.data.gender === 'Female' ? '♀️' : '⚪';
    } else {
      genderSymbol.textContent = '⚪';
    }
    genderAgeRow.appendChild(genderSymbol);

    if (character.data.age) {
      const ageSpan = document.createElement('span');
      ageSpan.className = 'character-card-age-text';
      ageSpan.textContent = `Age: ${character.data.age}`;
      genderAgeRow.appendChild(ageSpan);
    }

    card.appendChild(genderAgeRow);

    // Character details
    const details = document.createElement('div');
    details.className = 'character-card-details';

    if (character.data.roleArchetype) {
      const roleLine = document.createElement('p');
      roleLine.className = 'character-card-detail-line';
      roleLine.innerHTML = `<strong>Role:</strong> ${this.escapeHtml(character.data.roleArchetype)}`;
      details.appendChild(roleLine);
    }

    if (character.data.personality) {
      const personalityPreview = character.data.personality.substring(0, 50) + (character.data.personality.length > 50 ? '...' : '');
      const personalityLine = document.createElement('p');
      personalityLine.className = 'character-card-detail-line';
      personalityLine.innerHTML = `<strong>Personality:</strong> ${this.escapeHtml(personalityPreview)}`;
      details.appendChild(personalityLine);
    }

    card.appendChild(details);

    // Card footer with actions
    const footer = document.createElement('div');
    footer.className = 'character-card-footer';

    const editBtn = document.createElement('button');
    editBtn.className = 'character-card-btn';
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', () => {
      const event = new CustomEvent('characterSelected', {
        detail: { character }
      });
      document.dispatchEvent(event);
    });
    footer.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'character-card-btn character-card-delete-btn';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onDeleteCharacter(character.id, character.name);
    });
    footer.appendChild(deleteBtn);

    card.appendChild(footer);

    return card;
  }

  /**
   * Renders all character cards into the given container
   * @param {HTMLElement} container
   */
  renderCharacterCards(container) {
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
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'character-list-empty';
      emptyMsg.textContent = this.searchQuery
        ? 'No characters found'
        : 'No characters yet. Click "Add Character" to create one!';
      container.appendChild(emptyMsg);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'character-cards-grid';

    characters.forEach((character) => {
      const card = this.createCharacterCard(character);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  /**
   * Updates the character cards display
   */
  updateCharacterCards() {
    const container = document.getElementById('character-cards-container');
    if (container) {
      this.renderCharacterCards(container);
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
      this.updateCharacterCards();
      document.dispatchEvent(new CustomEvent('characterDeleted'));
    }
  }

  /**
   * Escapes HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
