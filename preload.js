// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose secure functions to the renderer processes
contextBridge.exposeInMainWorld('api', {
    // CRUD Operations exposed to the renderer (using ipcRenderer.invoke)
    addToWatchlist: (animeData) => ipcRenderer.invoke('add-to-watchlist', animeData),
    getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
    updateWatchlistItem: (id, updateData) => ipcRenderer.invoke('update-watchlist-item', id, updateData),
    deleteFromWatchlist: (id) => ipcRenderer.invoke('delete-from-watchlist', id),

    // We can add a function to change pages later if needed, but for now
    // the watchlist button can be a simple link to watchlist.html 
    // or we'll add a specific method here later for routing.
});