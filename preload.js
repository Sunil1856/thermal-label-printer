const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  print: (options) => ipcRenderer.invoke('dialog:print', options),
  getPrinters: () => ipcRenderer.invoke('system:getPrinters')
});
