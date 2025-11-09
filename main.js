// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DataStore } = require('./crud_logic');

// Initialize the DataStore instance (OOP principle)
const store = new DataStore();

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            // Context Isolation is a security feature, set to true
            contextIsolation: true,
            // Preload script is required for secure IPC communication
            preload: path.join(__dirname, 'preload.js') 
        }
    });

    // Load the main discovery/home screen
    mainWindow.loadFile('index.html');
    
    // Optional: Open DevTools for debugging during development
    // mainWindow.webContents.openDevTools();
}

// Electron lifecycle handler
app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});


// --- IPC CRUD Handlers (Main Process listens to Renderer Requests) ---

// CREATE: Handles the 'add-to-watchlist' request from the renderer
ipcMain.handle('add-to-watchlist', (event, animeData) => {
    try {
        // Calls the OOP method in crud_logic.js
        return store.addToWatchlist(animeData);
    } catch (error) {
        return { success: false, message: 'Failed to add item: ' + error.message };
    }
});

// READ: Handles the 'get-watchlist' request from the renderer
ipcMain.handle('get-watchlist', () => {
    try {
        // Calls the OOP method in crud_logic.js
        return store.getWatchlist();
    } catch (error) {
        return { success: false, message: 'Failed to load watchlist: ' + error.message };
    }
});

// UPDATE: Handles the 'update-watchlist-item' request from the renderer
ipcMain.handle('update-watchlist-item', (event, id, updateData) => {
    try {
        // Calls the OOP method in crud_logic.js
        return store.updateWatchlist(id, updateData);
    } catch (error) {
        return { success: false, message: 'Failed to update item: ' + error.message };
    }
});

// DELETE: Handles the 'delete-from-watchlist' request from the renderer
ipcMain.handle('delete-from-watchlist', (event, id) => {
    try {
        // Calls the OOP method in crud_logic.js
        return store.deleteFromWatchlist(id);
    } catch (error) {
        return { success: false, message: 'Failed to delete item: ' + error.message };
    }
});