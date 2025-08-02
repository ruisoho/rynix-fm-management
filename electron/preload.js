const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', callback);
  },
  
  // Remove menu action listener
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  },
  
  // App info
  getAppVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  },
  
  // Platform info
  getPlatform: () => {
    return process.platform;
  },
  
  // Database operations (if needed for direct access)
  // Note: In this app, we'll use HTTP API instead
  
  // File operations for export/import
  showSaveDialog: (options) => {
    return ipcRenderer.invoke('show-save-dialog', options);
  },
  
  showOpenDialog: (options) => {
    return ipcRenderer.invoke('show-open-dialog', options);
  },
  
  // Notification
  showNotification: (title, body) => {
    return ipcRenderer.invoke('show-notification', { title, body });
  }
});

// Security: Remove access to Node.js APIs
delete window.require;
delete window.exports;
delete window.module;