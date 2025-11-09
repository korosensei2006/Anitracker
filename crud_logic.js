// crud_logic.js
const fs = require('fs');
const path = require('path');

// Define the path where the watchlist data will be stored (in the user's home directory)
const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
const storePath = path.join(userDataPath, 'anitracker-watchlist.json');

/**
 * Class to handle all persistent Watchlist data storage and CRUD operations.
 * This demonstrates the principle of Separation of Concerns.
 */
class DataStore {
    constructor() {
        this.watchlist = this.loadWatchlist();
    }

    // R in CRUD: Reads the watchlist from the file
    loadWatchlist() {
        try {
            // Check if the file exists and read its content
            return JSON.parse(fs.readFileSync(storePath));
        } catch (error) {
            // If file doesn't exist or is corrupted, return an empty array
            console.error('Watchlist file not found or corrupted, starting fresh.', error);
            return [];
        }
    }

    // Helper method: Writes the current watchlist array to the file
    saveWatchlist() {
        // We must use string concatenation here as per our convention!
        fs.writeFileSync(storePath, JSON.stringify(this.watchlist, null, 2));
    }

    // C in CRUD: Adds a new Anime object to the watchlist
    addToWatchlist(animeData) {
        // Check if item already exists based on ID
        if (this.watchlist.some(anime => anime.id === animeData.id)) {
            return { success: false, message: 'Anime is already in your watchlist.' };
        }
        
        // Add the new item and save
        this.watchlist.push(animeData);
        this.saveWatchlist();
        return { success: true, message: animeData.title + ' added to watchlist successfully.' };
    }

    // R in CRUD: Returns the full watchlist
    getWatchlist() {
        return this.watchlist;
    }

    // U in CRUD: Finds an item by ID and updates its properties
    updateWatchlist(id, updateData) {
        const index = this.watchlist.findIndex(anime => anime.id === id);
        
        if (index !== -1) {
            // Merge existing data with new update data
            this.watchlist[index] = Object.assign(this.watchlist[index], updateData);
            this.saveWatchlist();
            return { success: true, message: 'Watchlist item updated.' };
        }
        return { success: false, message: 'Anime not found in watchlist.' };
    }

    // D in CRUD: Removes an item by ID
    deleteFromWatchlist(id) {
        const initialLength = this.watchlist.length;
        this.watchlist = this.watchlist.filter(anime => anime.id !== id);
        
        if (this.watchlist.length < initialLength) {
            this.saveWatchlist();
            return { success: true, message: 'Anime removed from watchlist.' };
        }
        return { success: false, message: 'Anime not found in watchlist.' };
    }
}

module.exports = {
    DataStore
};