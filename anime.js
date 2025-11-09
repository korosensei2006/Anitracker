// anime.js

/**
 * Class representing a single Anime entry.
 * This demonstrates Encapsulation (OOP principle).
 */
class Anime {
    constructor(data) {
        // Essential properties from Jikan API (Simple Assignment)
        this.id = data.mal_id;
        this.title = data.title;
        this.synopsis = data.synopsis || 'Synopsis not available.';
        this.score = data.score || 'N/A';
        this.rank = data.rank || 'N/A';
        this.popularity = data.popularity || 'N/A';
        this.episodes = data.episodes;
        this.type = data.type;
        this.source = data.source;
        this.rating = data.rating;
        this.image_url = data.images.webp.large_image_url;
        this.mal_url = data.url;
        
        // Complex properties (Arrays): Now using simple assignment as requested.
        // We assign the raw array of objects provided by the API.
        this.genres = data.genres || [];
        this.producers = data.producers || [];

        // Local Watchlist Tracking Properties (for CRUD)
        this.isManga = data.type === 'Manga'; 
        this.progressUnit = this.isManga ? 'Chapter' : 'Episode';
        this.totalUnits = this.isManga ? data.chapters : data.episodes;
        this.watchedProgress = 0; 
        this.review = ''; 
    }

    // Example OOP method (Helper method)
    getWatchedProgress() {
        return this.watchedProgress + ' of ' + this.totalUnits + ' ' + this.progressUnit + 's';
    }
}

// Node.js/CommonJS export
export {
    Anime
};