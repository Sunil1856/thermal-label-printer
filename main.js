const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverInstance = null;
const PORT = 3000;

function checkServerReady(cb, retries = 20) {
  http.get(`http://localhost:${PORT}/api/network-info`, (res) => {
    if (res.statusCode === 200) cb();
    else if (retries > 0) setTimeout(() => checkServerReady(cb, retries - 1), 200);
    else cb();
  }).on('error', () => {
    if (retries > 0) setTimeout(() => checkServerReady(cb, retries - 1), 200);
    else cb();
  });
}

function startServer() {
  try {
    // Check if server is already running
    http.get(`http://localhost:${PORT}/api/network-info`, () => {
      // Server already running on 3000
    }).on('error', () => {
      // Start internal server
      require('./server.js');
    });
  } catch (err) {
    console.error('Server startup error:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'ThermalPrint CAD - Visual Label Designer Studio',
    backgroundColor: '#0b1120',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  checkServerReady(() => {
    mainWindow.loadURL(`http://localhost:${PORT}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Native application menu template for Desktop App
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('system:getPrinters', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('dialog:print', async (event, options) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  return new Promise((resolve) => {
    mainWindow.webContents.print(options || { silent: false, printBackground: true }, (success, failureReason) => {
      resolve({ success, failureReason });
    });
  });
});

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
