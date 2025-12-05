/**
 * Main Application File
 * Initializes the app, manages sections, and coordinates the panel system
 */

class App {
  constructor() {
    this.currentSection = null;
    this.panelSystem = new PanelSystem();
    this.projectManager = new ProjectManager();
    this.characterManager = null;
    this.isProjectLoaded = false;
    
    this.sections = {
      writing: document.getElementById('writing-section'),
      plotting: document.getElementById('plotting-section'),
      characters: document.getElementById('characters-section'),
      worldbuilding: document.getElementById('worldbuilding-section'),
      research: document.getElementById('research-section')
    };

    this.savedLayouts = {};
    this.setupSections = {};
    this.sectionPanelSelections = {};
    this.isReady = false;

    // Remember character view sort/filter across views
    this.characterViewState = {
      sortBy: 'name-asc',
      importanceFilter: { primary: true, secondary: true, tertiary: true },
      genderFilter: { male: true, female: true, other: true }
    };
  }

  /**
   * Initializes the app
   */
  async init() {
    console.log('App init started');
    await this.loadAppState();
    this.showHomeScreen();
    this.isReady = true;
  }

  /**
   * Loads app state (projects, layouts, etc.)
   */
  async loadAppState() {
    return new Promise((resolve) => {
      window.electronAPI.getLayoutState((state) => {
        if (state) {
          if (state.panelLayouts) this.savedLayouts = state.panelLayouts;
          if (state.setupSections) this.setupSections = state.setupSections;
          if (state.sectionPanelSelections) this.sectionPanelSelections = state.sectionPanelSelections;
          if (state.projects) this.projectManager.projects = state.projects;
        }
        resolve();
      });
    });
  }

  /**
   * Shows the home screen
   */
  showHomeScreen() {
    const homeContainer = document.getElementById('home-container');
    const appContainer = document.getElementById('app-container');
    
    homeContainer.innerHTML = '';
    appContainer.style.display = 'none';
    // Ensure home screen is visible after returning from app
    homeContainer.style.display = 'block';

    const homeScreen = new HomeScreen(this.projectManager, (action) => this.handleHomeAction(action));
    homeContainer.appendChild(homeScreen.render());
  }

  /**
   * Handles home screen actions
   */
  handleHomeAction(action) {
    if (action === 'new') {
      this.showNewProjectDialog();
    } else if (action === 'open') {
      this.showOpenProjectDialog();
    } else if (action === 'loaded') {
      this.loadProject();
    }
  }

  /**
   * Shows new project dialog
   */
  async showNewProjectDialog() {
    const dialog = new TextInputDialog('New Project', 'Enter project name...');
    const projectName = await dialog.show();
    if (!projectName) return;

    // Show feature selection dialog
    this.showFeatureSelectionDialog(projectName);
  }

  /**
   * Shows feature selection dialog
   */
  showFeatureSelectionDialog(projectName) {
    const availableFeatures = [
      { id: 'writing', title: 'Writing' },
      { id: 'characters', title: 'Characters' },
      { id: 'worldbuilding', title: 'World Building' },
      { id: 'plotting', title: 'Plotting' },
      { id: 'research', title: 'Research' }
    ];

    const dialog = new SetupDialog('Project Features', availableFeatures);
    dialog.show().then((selectedFeatures) => {
      const enabledSectionIds = selectedFeatures.map((f) => f.id);
      this.projectManager.createProject(projectName, enabledSectionIds, 'local');
      this.loadProject();
    });
  }

  /**
   * Shows open project dialog
   */
  showOpenProjectDialog() {
    const projects = this.projectManager.getAllProjects();
    if (projects.length === 0) {
      alert('No projects to open');
      return;
    }

    // For now, just show the first project
    // Later we can add a proper project picker dialog
    this.projectManager.loadProject(projects[0].id);
    this.loadProject();
  }

  /**
   * Loads the current project and shows the brain
   */
  loadProject() {
    const project = this.projectManager.getCurrentProject();
    if (!project) return;

    console.log('Loading project:', project.name);
    this.isProjectLoaded = true;

    // Initialize character manager for this project
    this.characterManager = new CharacterManager(this.projectManager);
    
    // Load character data if it exists
    if (project.data && project.data.characters) {
      this.characterManager.loadCharacterData(project.data.characters);
    }

    // Update navigation with enabled sections
    this.updateNavigationSections(project.enabledSections);

    // Show app container
    const homeContainer = document.getElementById('home-container');
    const appContainer = document.getElementById('app-container');
    homeContainer.style.display = 'none';
    appContainer.style.display = 'flex';

    // Load first enabled section
    if (project.enabledSections.length > 0) {
      this.switchSection(project.enabledSections[0]);
    }
  }

  /**
   * Updates navigation to show only enabled sections
   */
  updateNavigationSections(enabledSectionIds) {
    const navSections = document.getElementById('nav-sections');
    navSections.innerHTML = '';

    const sectionNames = {
      writing: 'Writing',
      plotting: 'Plotting',
      characters: 'Characters',
      worldbuilding: 'World Building',
      research: 'Research'
    };

    enabledSectionIds.forEach((sectionId) => {
      const btn = document.createElement('button');
      btn.className = 'nav-button';
      btn.setAttribute('data-section', sectionId);
      btn.textContent = sectionNames[sectionId];
      btn.addEventListener('click', () => this.switchSection(sectionId));
      navSections.appendChild(btn);
    });

    // Setup home button
    const homeBtn = document.getElementById('nav-home');
    homeBtn.addEventListener('click', () => this.goHome());
  }

  /**
   * Goes back to home screen
   */
  goHome() {
    this.isProjectLoaded = false;
    this.saveProjectState();
    this.showHomeScreen();
  }

  /**
   * Placeholder for future project-specific home navigation.
   * Once implemented, this should take the user to the selected project's
   * dedicated home/dashboard screen instead of the global project picker.
   */
  goProjectHome() {
    // TODO: Implement project-specific home/dashboard view.
    // For now, fall back to global home (project selection).
    this.showHomeScreen();
  }

  /**
   * Switches to a different section
   */
  switchSection(sectionName) {
    if (!this.isProjectLoaded) return;

    if (this.currentSection) {
      this.sections[this.currentSection].classList.remove('active');
    }

    // Update active button
    document.querySelectorAll('.nav-button').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-section') === sectionName) {
        btn.classList.add('active');
      }
    });

    this.currentSection = sectionName;
    this.loadSection(sectionName);
  }

  /**
   * Loads a section and creates its panels
   */
  async loadSection(sectionName) {
    if (!this.sections[sectionName]) return;

    const section = this.sections[sectionName];
    const container = section.querySelector('.layout-container');

    this.panelSystem.clearAllPanels(container);

    let panelConfigs;
    if (this.savedLayouts[sectionName] && this.savedLayouts[sectionName].length > 0) {
      console.log('Loading saved layout for section:', sectionName);
      panelConfigs = this.savedLayouts[sectionName];
      // Mark as setup if we have saved layouts
      if (!this.setupSections[sectionName]) {
        this.setupSections[sectionName] = true;
      }
    } else {
      if (!this.setupSections[sectionName]) {
        const layout = layouts[sectionName];
        if (layout && layout.panels) {
          console.log('First time in section:', sectionName);
          panelConfigs = await this.showSetupDialog(sectionName, layout.panels);
          const selectedPanelIds = panelConfigs.map((p) => p.id);
          this.setupSections[sectionName] = true;
          this.sectionPanelSelections[sectionName] = selectedPanelIds;
          // Save the selected panels to savedLayouts so they load next time
          this.savedLayouts[sectionName] = panelConfigs;
          console.log('Setup complete for section:', sectionName, 'setupSections:', this.setupSections);
        }
      } else {
        const layout = layouts[sectionName];
        const selectedIds = this.sectionPanelSelections[sectionName] || [];

        if (layout && layout.panels) {
          panelConfigs = layout.panels.filter((panel) => selectedIds.includes(panel.id));
        }
      }
    }

    if (panelConfigs && panelConfigs.length > 0) {
      panelConfigs.forEach((panelConfig) => {
        this.panelSystem.createPanel(panelConfig, container, () => this.saveProjectState());
      });
      // Save after a brief delay to ensure panels are rendered
      setTimeout(() => this.saveProjectState(), 50);
    }

    // Initialize character views if this is the characters section
    if (sectionName === 'characters' && this.characterManager) {
      this.initializeCharacterViews();
    }

    section.classList.add('active');
  }

  /**
   * Initializes character list and editor views
   */
  initializeCharacterViews() {
    const characterListPanel = document.getElementById('character-list');
    const characterEditorPanel = document.getElementById('character-editor');

    if (!characterListPanel || !characterEditorPanel) {
      console.warn('Character panels not found');
      return;
    }

    // Create character list view by default
    this.loadCharacterListView(characterListPanel, characterEditorPanel);

    // Create character editor panel
    const editorView = new CharacterEditorPanel(this.characterManager);
    characterEditorPanel.innerHTML = '';
    characterEditorPanel.appendChild(editorView.render());

    // Store editor view in window scope for event listeners
    window.characterEditorView = editorView;
    window.characterListPanel = characterListPanel;
    window.characterEditorPanel = characterEditorPanel;

    // Wire event handlers - remove old listeners first to avoid duplicates
    document.removeEventListener('characterSelected', window.onCharacterSelected);
    document.removeEventListener('addCharacter', window.onAddCharacter);
    document.removeEventListener('characterDeleted', window.onCharacterDeleted);
    document.removeEventListener('characterUpdated', window.onCharacterUpdated);
    document.removeEventListener('switchCharacterView', window.onSwitchCharacterView);

    // Add new listeners
    window.onCharacterSelected = (e) => {
      console.log('Character selected:', e.detail.character.id);
      // Show the editor panel when a character is selected
      this.panelSystem.showPanel('character-editor');
      // Adjust panels to fit window
      this.adjustCharacterPanelLayout(true);
      window.characterEditorView.loadCharacter(e.detail.character.id);
    };

    window.onAddCharacter = () => {
      this.showNewCharacterDialog();
    };

    window.onCharacterDeleted = (e) => {
      console.log('Character deleted');
      this.saveProjectState();
    };

    window.onCharacterUpdated = (e) => {
      console.log('Character updated');
      // Refresh the current character view
      this.refreshCurrentCharacterView();
      this.saveProjectState();
    };

    window.onSwitchCharacterView = (e) => {
      const view = e.detail.view;
      console.log('Switching to view:', view);
      if (view === 'card') {
        this.loadCharacterCardView(characterListPanel);
      } else if (view === 'importance') {
        this.loadCharacterImportanceView(characterListPanel);
      } else {
        this.loadCharacterListView(characterListPanel, characterEditorPanel);
      }
    };

    document.addEventListener('characterSelected', window.onCharacterSelected);
    document.addEventListener('addCharacter', window.onAddCharacter);
    document.addEventListener('characterDeleted', window.onCharacterDeleted);
    document.addEventListener('characterUpdated', window.onCharacterUpdated);
    document.addEventListener('switchCharacterView', window.onSwitchCharacterView);

    // Adjust layout after panels are rendered and measured
    setTimeout(() => {
      this.adjustCharacterPanelLayout(false);
    }, 0);

    // Add window resize listener to adjust layout on resize
    window.removeEventListener('resize', window.onWindowResize);
    // Debounce helper to avoid excessive recalculations
    const debounce = (fn, delay) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
      };
    };

    window.onWindowResize = debounce(() => {
      const currentView = window.currentCharacterView || 'list';
      const editorVisible = window.characterEditorPanel && window.characterEditorPanel.style.display !== 'none';
      this.adjustCharacterPanelLayout(editorVisible);
    }, 150);
    window.addEventListener('resize', window.onWindowResize);
  }

  /**
   * Loads the character list view
   */
  loadCharacterListView(panel, editorPanel) {
    const listView = new CharacterListView(this.characterManager, this.characterViewState);
    panel.innerHTML = '';
    panel.appendChild(listView.render());
    window.currentCharacterView = 'list';
  }

  /**
   * Loads the character card view
   */
  loadCharacterCardView(panel) {
    const cardView = new CharacterCardView(this.characterManager, this.characterViewState);
    panel.innerHTML = '';
    panel.appendChild(cardView.render());
    window.currentCharacterView = 'card';
  }

  /**
   * Loads the character importance view (placeholder for now)
   */
  loadCharacterImportanceView(panel) {
    const importanceView = new CharacterImportanceView(this.characterManager, this.characterViewState);
    panel.innerHTML = '';
    panel.appendChild(importanceView.render());
    window.currentCharacterView = 'importance';
  }

  /**
   * Refreshes the current character view
   */
  refreshCurrentCharacterView() {
    const currentView = window.currentCharacterView || 'list';
    const panel = window.characterListPanel;
    
    // Hide the editor panel and adjust layout
    this.panelSystem.hidePanel('character-editor');
    this.adjustCharacterPanelLayout(false);
    
    if (currentView === 'list') {
      this.loadCharacterListView(panel, window.characterEditorPanel);
    } else if (currentView === 'card') {
      this.loadCharacterCardView(panel);
    } else if (currentView === 'importance') {
      this.loadCharacterImportanceView(panel);
    }
  }

  /**
   * Adjusts character panel layout to fit the window
   * @param {boolean} editorVisible - Whether editor panel should be visible
   */
  adjustCharacterPanelLayout(editorVisible) {
    const listPanel = document.getElementById('character-list');
    const editorPanel = document.getElementById('character-editor');
    const container = document.querySelector('#characters-section .layout-container');
    const headerBar = document.querySelector('#character-list .character-filter-bar');
    
    if (!listPanel || !container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const currentView = window.currentCharacterView || 'list';
    const headerHeight = headerBar ? headerBar.offsetHeight : 0;
    
    // Clamp helper
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    
    console.log(`Adjusting layout: containerWidth=${containerWidth}, editorVisible=${editorVisible}`);

    if (editorVisible && editorPanel) {
      // View-aware editor width cap
      const maxEditorPct = currentView === 'importance' ? 0.65 : 0.70;
      const minEditorPx = 320;
      const gapPx = 10;

      // Base split
      let listWidth = Math.floor(containerWidth * (1 - maxEditorPct));
      let editorWidth = containerWidth - listWidth - gapPx;

      // Ensure editor stays within bounds
      editorWidth = clamp(editorWidth, minEditorPx, Math.floor(containerWidth * maxEditorPct));
      // Recompute list to honor gap and clamped editor
      listWidth = clamp(containerWidth - editorWidth - gapPx, 280, containerWidth);

      listPanel.style.left = '0px';
      listPanel.style.top = '0px';
      listPanel.style.width = listWidth + 'px';
      listPanel.style.height = containerHeight + 'px';

      editorPanel.style.left = (listWidth + gapPx) + 'px';
      editorPanel.style.top = '0px';
      editorPanel.style.width = editorWidth + 'px';
      editorPanel.style.height = containerHeight + 'px';
      
      // Add a small right-side buffer to list when header is tall (wrapped)
      if (headerHeight > 32) {
        listPanel.style.paddingRight = '8px';
      } else {
        listPanel.style.paddingRight = '0px';
      }

      // Guarantee header has enough height for two rows when editor is visible
      if (headerBar) {
        headerBar.style.minHeight = headerHeight > 32 ? headerHeight + 'px' : '32px';
      }

      console.log(`Editor visible: list=${listWidth}px, editor=${editorWidth}px`);
    } else {
      // List takes full width
      listPanel.style.left = '0px';
      listPanel.style.top = '0px';
      listPanel.style.width = containerWidth + 'px';
      listPanel.style.height = containerHeight + 'px';
      listPanel.style.paddingRight = '0px';
      if (headerBar) headerBar.style.minHeight = '32px';
      
      console.log(`Editor hidden: list=${containerWidth}px`);
    }
  }

  /**
   * Shows new character dialog
   */
  showNewCharacterDialog() {
    const dialog = new TextInputDialog('New Character', 'Enter character name...');
    dialog.show().then((name) => {
      if (!name) return;
      
      // Create character with default flag (normalized id)
      const character = this.characterManager.createCharacter(name, 'primary');
      console.log('New character created:', character);
      
      // Refresh current view to show new character
      this.refreshCurrentCharacterView();
      this.saveProjectState();
    });
  }

  /**
   * Refreshes the character list view (legacy method - kept for compatibility)
   */
  refreshCharacterList() {
    this.refreshCurrentCharacterView();
  }

  /**
   * Shows setup dialog for panels
   */
  showSetupDialog(sectionName, availablePanels) {
    const dialog = new SetupDialog(sectionName, availablePanels);
    return dialog.show();
  }

  /**
   * Saves project state
   */
  saveProjectState() {
    if (!this.currentSection) return;

    // Get current panel state - this captures positions and sizes
    const currentLayout = this.panelSystem.getPanelState();
    
    // Only save if we actually have panels (filter out empty layouts)
    if (currentLayout && currentLayout.length > 0) {
      this.savedLayouts[this.currentSection] = currentLayout;
    }

    // Save character data with project
    const project = this.projectManager.getCurrentProject();
    if (project && this.characterManager) {
      project.data.characters = {
        characters: this.characterManager.characters,
        customFlags: this.characterManager.customFlags
      };
    }

    window.electronAPI.saveLayoutState({
      panelLayouts: this.savedLayouts,
      setupSections: this.setupSections,
      sectionPanelSelections: this.sectionPanelSelections,
      projects: this.projectManager.projects
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  window.app = new App();
  await window.app.init();
});
