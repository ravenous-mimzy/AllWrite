const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process (frontend)
contextBridge.exposeInMainWorld('electronAPI', {
  // Save layout state to the backend
  saveLayoutState: (state) => {
    console.log('Preload: Sending save-layout-state');
    ipcRenderer.send('save-layout-state', state);
  },
  
  // Get layout state from the backend (using Promise-based approach)
  getLayoutState: (callback) => {
    ipcRenderer.once('layout-state', (event, state) => {
      console.log('Preload: Received layout-state response');
      callback(state);
    });
    console.log('Preload: Requesting get-layout-state');
    ipcRenderer.send('get-layout-state');
  }
});
