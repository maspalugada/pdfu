const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: (textContent) => ipcRenderer.invoke('save-pdf', textContent),
  openPdf: () => ipcRenderer.invoke('open-pdf'),
  mergePdfs: () => ipcRenderer.invoke('merge-pdfs'),
});
