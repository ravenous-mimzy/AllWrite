/**
 * Text Input Dialog
 * Simple dialog for getting text input from user
 */

class TextInputDialog {
  constructor(title, placeholder = '') {
    this.title = title;
    this.placeholder = placeholder;
  }

  /**
   * Shows the dialog and returns a promise with the input value
   * @returns {Promise<string>} Promise that resolves with user input
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
      title.textContent = this.title;

      // Input field
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'text-input-dialog-input';
      input.placeholder = this.placeholder;
      input.focus();

      // Button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'setup-dialog-buttons';

      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className = 'setup-dialog-button';
      cancelBtn.style.backgroundColor = '#95a5a6';
      cancelBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(null);
      });

      // OK button
      const okBtn = document.createElement('button');
      okBtn.textContent = 'OK';
      okBtn.className = 'setup-dialog-button';
      okBtn.addEventListener('click', () => {
        const value = input.value.trim();
        overlay.remove();
        resolve(value || null);
      });

      // Allow Enter key to submit
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          okBtn.click();
        }
      });

      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(okBtn);

      // Assemble dialog
      dialog.appendChild(title);
      dialog.appendChild(input);
      dialog.appendChild(buttonContainer);
      overlay.appendChild(dialog);

      // Add to page
      document.body.appendChild(overlay);
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextInputDialog;
}
