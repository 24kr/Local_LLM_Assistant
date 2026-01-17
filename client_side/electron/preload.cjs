const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
    // File selection
    selectFile: () => ipcRenderer.invoke('select-file'),

    // App info
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Platform info
    platform: process.platform,

    // Versions
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    },

    // Check if running in Electron
    isElectron: true
});