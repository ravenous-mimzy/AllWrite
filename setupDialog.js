/**
 * Setup Dialog
 * Handles the first-time setup for each section
 */

class SetupDialog {
  constructor(sectionName, availablePanels) {
    this.sectionName = sectionName;
    this.availablePanels = availablePanels;
    this.selectedPanels = [];
  }

  /**
   * Shows the setup dialog and returns a promise with selected panels
   * @returns {Promise<Array>} Promise that resolves with selected panel configs
   */
  show() {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'setup-dialog-overlay';

      // Create dialog container
      const dialog = document.createElement('div');
      dialog.className = 'setup-dialog';

      // Title
      const title = document.createElement('h2');
      title.textContent = `Setup ${this.sectionName} Section`;

      // Description
      const description = document.createElement('p');
      description.className = 'setup-dialog-description';
      description.textContent = 'Select which panels you want to use in this section. You can always customize this later!';

      // Panels list
      const panelsList = document.createElement('div');
      panelsList.className = 'setup-dialog-panels';

      this.availablePanels.forEach((panel) => {
        const panelOption = document.createElement('label');
        panelOption.className = 'setup-dialog-panel-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = panel.id;
        checkbox.checked = true; // Check all by default
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!this.selectedPanels.includes(panel.id)) {
              this.selectedPanels.push(panel.id);
            }
          } else {
            this.selectedPanels = this.selectedPanels.filter((id) => id !== panel.id);
          }
        });

        const label = document.createElement('span');
        label.textContent = panel.title;

        panelOption.appendChild(checkbox);
        panelOption.appendChild(label);
        panelsList.appendChild(panelOption);

        // Track selected by default
        this.selectedPanels.push(panel.id);
      });

      // Button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'setup-dialog-buttons';

      // Continue button
      const continueBtn = document.createElement('button');
      continueBtn.textContent = 'Continue';
      continueBtn.className = 'setup-dialog-button';
      continueBtn.addEventListener('click', () => {
        overlay.remove();
        const selectedConfigs = this.availablePanels.filter((panel) =>
          this.selectedPanels.includes(panel.id)
        );
        resolve(selectedConfigs);
      });

      buttonContainer.appendChild(continueBtn);

      // Assemble dialog
      dialog.appendChild(title);
      dialog.appendChild(description);
      dialog.appendChild(panelsList);
      dialog.appendChild(buttonContainer);
      overlay.appendChild(dialog);

      // Add to page
      document.body.appendChild(overlay);
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SetupDialog;
}
