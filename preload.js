const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: (textContent) => ipcRenderer.invoke('save-pdf', textContent),
});
