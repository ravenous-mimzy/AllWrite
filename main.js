const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Path to store layout state
const stateFile = path.join(os.homedir(), '.writersApp', 'layoutState.json');

function ensureStateDirectory() {
  const dir = path.dirname(stateFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLayoutState() {
  try {
    if (fs.existsSync(stateFile)) {
      const data = fs.readFileSync(stateFile, 'utf-8');
      console.log('Loaded state from file:', data);
      return JSON.parse(data);
    } else {
      console.log('State file does not exist yet:', stateFile);
    }
  } catch (error) {
    console.error('Error loading layout state:', error);
  }
  return null;
}

function saveLayoutState(state) {
  try {
    ensureStateDirectory();
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log('Layout state saved');
  } catch (error) {
    console.error('Error saving layout state:', error);
  }
}

let mainWindow;
let currentLayoutState = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
  mainWindow = win;
  
  // Save state before window closes
  win.on('close', () => {
    console.log('Window closing, saving state');
    if (currentLayoutState) {
      saveLayoutState(currentLayoutState);
    }
  });
}

app.whenReady().then(() => {
  // Load saved layout state
  console.log('App ready, loading layout state from file at:', stateFile);
  currentLayoutState = loadLayoutState();
  console.log('Loaded layout state:', currentLayoutState ? JSON.stringify(currentLayoutState) : 'null');
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Save state before quitting
  if (currentLayoutState) {
    saveLayoutState(currentLayoutState);
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Also save state when app is about to quit
app.on('before-quit', () => {
  if (currentLayoutState) {
    saveLayoutState(currentLayoutState);
  }
});

// Handle IPC messages from frontend
ipcMain.on('get-layout-state', (event) => {
  console.log('Sending layout state to frontend');
  event.sender.send('layout-state', currentLayoutState);
});

ipcMain.on('save-layout-state', (event, state) => {
  console.log('Saving layout state from frontend');
  console.log('Received state:', JSON.stringify(state, null, 2));
  currentLayoutState = state;
  saveLayoutState(state);
  console.log('State saved to file');
});
