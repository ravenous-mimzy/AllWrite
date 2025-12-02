/**
 * Panel System
 * Handles all draggable panel functionality
 */

class PanelSystem {
  constructor() {
    this.panels = new Map();
    this.draggingPanel = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  /**
   * Creates a panel based on panel configuration
   * @param {Object} panelConfig - Configuration object with id, title, x, y, width, height
   * @param {HTMLElement} container - The container to add the panel to
   * @param {Function} onStateChange - Callback when panel state changes
   */
  createPanel(panelConfig, container, onStateChange) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = panelConfig.id;
    panel.style.left = panelConfig.x + 'px';
    panel.style.top = panelConfig.y + 'px';
    panel.style.width = panelConfig.width + 'px';
    panel.style.height = panelConfig.height + 'px';

    // Hide panel if hidden property is set
    if (panelConfig.hidden) {
      panel.style.display = 'none';
    }

    // Create panel header
    const header = document.createElement('div');
    header.className = 'panel-header';

    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = panelConfig.title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'panel-close-btn';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.removePanel(panelConfig.id));

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create panel content area
    const content = document.createElement('div');
    content.className = 'panel-content';
    content.innerHTML = `<p>Panel: ${panelConfig.title}</p>`;

    panel.appendChild(header);
    panel.appendChild(content);

    container.appendChild(panel);

    // Store panel reference
    this.panels.set(panelConfig.id, {
      element: panel,
      config: panelConfig
    });

    // Add drag listeners
    this.addDragListeners(header, panel, onStateChange);
  }

  /**
   * Adds drag event listeners to a panel header
   * @param {HTMLElement} header - The panel header element
   * @param {HTMLElement} panel - The panel element
   * @param {Function} onStateChange - Callback when drag ends
   */
  addDragListeners(header, panel, onStateChange) {
    header.addEventListener('mousedown', (e) => this.startDrag(e, panel));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag(onStateChange));
  }

  /**
   * Handles the start of a panel drag
   * @param {MouseEvent} e - The mouse event
   * @param {HTMLElement} panel - The panel being dragged
   */
  startDrag(e, panel) {
    this.draggingPanel = panel;
    panel.classList.add('dragging');

    const rect = panel.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    // Bring panel to front
    panel.style.zIndex = this.getHighestZIndex() + 1;
  }

  /**
   * Handles panel movement during drag
   * @param {MouseEvent} e - The mouse event
   */
  drag(e) {
    if (!this.draggingPanel) return;

    const container = this.draggingPanel.parentElement;
    const containerRect = container.getBoundingClientRect();

    let x = e.clientX - containerRect.left - this.dragOffset.x;
    let y = e.clientY - containerRect.top - this.dragOffset.y;

    // Prevent panel from being dragged outside container
    x = Math.max(0, Math.min(x, containerRect.width - this.draggingPanel.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - this.draggingPanel.offsetHeight));

    this.draggingPanel.style.left = x + 'px';
    this.draggingPanel.style.top = y + 'px';
  }

  /**
   * Handles the end of a panel drag
   * @param {Function} onStateChange - Callback function when drag ends
   */
  stopDrag(onStateChange) {
    if (this.draggingPanel) {
      this.draggingPanel.classList.remove('dragging');
      this.draggingPanel = null;
      
      // Notify that state has changed (for saving)
      if (onStateChange) {
        onStateChange();
      }
    }
  }

  /**
   * Removes a panel from the layout
   * @param {string} panelId - The ID of the panel to remove
   */
  removePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.element.remove();
      this.panels.delete(panelId);
    }
  }

  /**
   * Clears all panels from a container
   * @param {HTMLElement} container - The container to clear
   */
  clearAllPanels(container) {
    this.panels.forEach((panel) => {
      panel.element.remove();
    });
    this.panels.clear();
  }

  /**
   * Gets the highest z-index of all panels
   * @returns {number} The highest z-index
   */
  getHighestZIndex() {
    let highest = 0;
    this.panels.forEach((panel) => {
      const zIndex = parseInt(window.getComputedStyle(panel.element).zIndex) || 0;
      highest = Math.max(highest, zIndex);
    });
    return highest;
  }

  /**
   * Gets the current state of all panels (positions and sizes)
   * @returns {Array} Array of panel states
   */
  getPanelState() {
    const state = [];
    this.panels.forEach((panel) => {
      state.push({
        id: panel.config.id,
        title: panel.config.title,
        x: parseInt(panel.element.style.left),
        y: parseInt(panel.element.style.top),
        width: panel.element.offsetWidth,
        height: panel.element.offsetHeight
      });
    });
    return state;
  }

  /**
   * Restores panel state from saved configuration
   * @param {Array} state - Array of panel states to restore
   * @param {HTMLElement} container - The container to add panels to
   */
  restorePanelState(state, container) {
    state.forEach((panelState) => {
      const panel = this.panels.get(panelState.id);
      if (panel) {
        panel.element.style.left = panelState.x + 'px';
        panel.element.style.top = panelState.y + 'px';
        panel.element.style.width = panelState.width + 'px';
        panel.element.style.height = panelState.height + 'px';
      }
    });
  }

  /**
   * Shows a panel
   * @param {string} panelId - The panel ID to show
   */
  showPanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.element.style.display = 'block';
    }
  }

  /**
   * Hides a panel
   * @param {string} panelId - The panel ID to hide
   */
  hidePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.element.style.display = 'none';
    }
  }

  /**
   * Toggles panel visibility
   * @param {string} panelId - The panel ID to toggle
   */
  togglePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      const isHidden = panel.element.style.display === 'none';
      panel.element.style.display = isHidden ? 'block' : 'none';
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PanelSystem;
}
