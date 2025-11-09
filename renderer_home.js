// renderer_home.js

// FIX 2: Import the Anime class from anime.js
import { Anime } from './anime.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const goToWatchlistBtn = document.getElementById('goToWatchlistBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsTitle = document.getElementById('resultsTitle');
const resultsContainer = document.getElementById('resultsContainer');
const animeModal = document.getElementById('animeModal');
const modalBody = document.getElementById('modalBody');

// Jikan API Base URL
const animeapi = 'https://api.jikan.moe/v4';

// Utility Function (No backticks, only '+' for concatenation)
function safeText(text) {
    if (typeof text !== 'string') {
        return text;
    }
    // Simple sanitization: Replace HTML control characters with entities
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


// --- API Functions ---

// 1. Function to handle the search logic (Now using Promises)
function searchAnime(query) {
    query = query.trim();
    if (!query) {
        alert('Please enter an anime name to search.');
        return;
    }

    loadingIndicator.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    fetch(animeapi + '/anime?q=' + encodeURIComponent(query) + '&limit=15')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch anime data. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            loadingIndicator.style.display = 'none';
            
            if (data.data && data.data.length > 0) {
                // OOP: Convert raw JSON data into instances of the Anime Class
                const animeObjects = data.data.map(item => new Anime(item)); 
                displayResults(animeObjects, 'Search Results for "' + query + '"');
            } else {
                resultsTitle.textContent = 'No Results Found';
                resultsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No anime found matching your search. Try a different keyword.</p>';
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Search error:', error);
            alert('Error searching anime: ' + error.message);
        });
}

// 2. Function to fetch and display the seasonal anime on load (Now using Promises)
function loadSeasonalAnime() {
    loadingIndicator.style.display = 'block';
    resultsContainer.innerHTML = '';

    fetch(animeapi + '/seasons/now?limit=15')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch seasonal data. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            loadingIndicator.style.display = 'none';
            
            if (data.data && data.data.length > 0) {
                const animeObjects = data.data.map(item => new Anime(item)); 
                displayResults(animeObjects, 'Currently Airing Seasonal Anime');
            } else {
                resultsTitle.textContent = 'Seasonal Data Unavailable';
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            resultsTitle.textContent = 'Error Loading Seasonal Data';
            console.error('Seasonal load error:', error);
        });
}


// 3. Creative Mix Feature: Fetch characters for the modal (Now returns a Promise)
function getAnimeCharacters(animeId) {
    return fetch(animeapi + '/anime/' + animeId + '/characters')
        .then(response => {
            if (!response.ok) {
                // Do not throw a fatal error, just log and allow the next .then to handle empty data
                console.warn('Failed to fetch characters for ID ' + animeId + '. Status: ' + response.status);
                return { data: [] }; // Return an object with an empty data array
            }
            return response.json();
        })
        .then(data => {
            return data.data ? data.data.slice(0, 8) : []; // Limit to top 8 characters
        })
        .catch(error => {
            console.warn('Could not load characters for ID ' + animeId + ':', error);
            return []; // Always return an empty array on error
        });
}

// --- GUI Rendering Functions ---

function displayResults(animeList, title) {
    resultsTitle.textContent = title;
    resultsContainer.innerHTML = '';
    
    animeList.forEach(anime => {
        const card = createAnimeCard(anime);
        resultsContainer.appendChild(card);
    });
}

function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.setAttribute('data-mal-id', anime.id);

    // Attach click listener to show modal
    card.addEventListener('click', () => showAnimeDetails(anime));

    // FIX: Use g.name to get the genre string for the card display
    const genres = anime.genres && anime.genres.length > 0 
    ? anime.genres.slice(0, 3).map(g => '<span class="genre-tag">' + safeText(g.name)+',' + '</span>').join('') : '';

    card.innerHTML = 
        '<img src="' + anime.image_url + '" alt="' + safeText(anime.title) + '" class="anime-image">' +
        '<div class="anime-info">' +
        '<div class="anime-title" title="' + safeText(anime.title) + '">' + safeText(anime.title) + '</div>' +
        '<div class="anime-meta">' +
        '<span class="score">' + safeText(anime.score) + '</span>' +
        '<div></div>'+
        '<span class="episodes">' + safeText(anime.episodes||'Unknown') + ' Episode</span>' +
        '</div>' +
        '<div class="anime-genres">' + genres+ ''+'</div>' +
        '</div>';
        
    return card;
}

// After user choose the anime card data about chracters will show 
function showAnimeDetails(anime) {
    modalBody.innerHTML = '<h2>' + safeText(anime.title) + '</h2><p style="text-align:center; padding: 20px;">Loading details and characters...</p>';
    animeModal.style.display = 'block';
    
    // FIX 3: Lock the body scroll
    document.body.classList.add('modal-open');

    // Call the Promise-returning function and handle the result in .then()
    getAnimeCharacters(anime.id)
        .then(characters => {
            
            // Extract producer and genre names before creating HTML string
            const producerNames = anime.producers.map(p => safeText(p.name)).join(', ');
            const genreNames = anime.genres.map(g => safeText(g.name)).join(', ');
            
            let characterHtml = '';
            if (characters.length > 0) {
                characterHtml = '<div class="character-list"><h4>Main Characters</h4>' + 
                    characters.map(char => 
                        '<div class="character-item">' +
                            // We need to use optional chaining here just in case the nested structure is missing
                            '<img src="' + char.character?.images?.webp?.image_url + '" alt="' + safeText(char.character.name) + '" class="character-image">' +
                            '<p>' + safeText(char.character.name) + '</p>' +
                        '</div>'
                    ).join('') + 
                    '</div>';
            } else {
                characterHtml = '<p style="padding-top: 10px;">Character data unavailable.</p>';
            }
        
            modalBody.innerHTML = 
                '<div class="modal-header">' +
                    '<img src="' + anime.image_url + '" alt="' + anime.title + '" class="modal-image">' +
                    '<div class="modal-info">' +
                        '<h2>' + anime.title + '</h2>' +
                        '<div class="info-row"><span class="info-label">Score:</span> <span class="score">' + anime.score + '</span></div>' +
                        
                        
                        '<div class="info-row"><span class="info-label">Episodes:</span> ' +safeText(anime.episodes) + +'</div>' +
                        '<div></div>'+
                        '<div class="info-row"><span class="info-label">Producers:</span> ' + (producerNames || 'N/A') + '</div>' +
                        '<div class="info-row"><span class="info-label">Genres:</span> ' + (genreNames || 'N/A') + '</div>' +
                        '<p class="synopsis"><span class="info-label">Synopsis:</span> ' + anime.synopsis.substring(0, 300) + '...' + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-section">' +
                '<h3>Characters</h3>' + 
                characterHtml +
                '</div>' +
                '<div class="modal-actions">' +
                    '<a href="' + safeText(anime.mal_url) + '" target="_blank" class="btn btn-secondary btn-small">View on MyAnimeList</a>' +
                    // CREATE OPERATION BUTTON
                    '<button id="addToWatchlistBtn" class="btn btn-success btn-small">Add to Watchlist</button>' + 
                '</div>';
        
            // Add event listener for the Add to Watchlist button (CREATE)
            document.getElementById('addToWatchlistBtn').addEventListener('click', () => addToWatchlist(anime));
        
            animeModal.style.display = 'block';
        })
        .catch(error => {
               // In case of a rare catastrophic failure in getAnimeCharacters
            console.error("Error displaying anime details:", error);
            modalBody.innerHTML = '<h2>' + safeText(anime.title) + '</h2><p style="text-align:center; padding: 20px; color: red;">Failed to load all details.</p>';
            // Ensure we unlock scroll if an error occurs
            document.body.classList.remove('modal-open');
        });
}


// User Add Anime To Watchlist

function addToWatchlist(anime) {
    // window.api.addToWatchlist returns a Promise (from preload.js ipcRenderer.invoke)
    
    window.api.addToWatchlist(anime)
        .then(result => {
            if (result.success) {
                alert(anime.title + ' successfully added to your watchlist!');
                animeModal.style.display = 'none';
                document.body.classList.remove('modal-open'); //Allow the user to scroll 
            } else {
                alert('Failed to add ' + anime.title + ': ' + result.message);
            }
        })
        .catch(error => {
            alert('Error adding ' + anime.title + ': ' + error.message);
        });
}


// Event Listeners and Initial Load 
searchBtn.addEventListener('click', () => searchAnime(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchAnime(searchInput.value);
    }
});

// Navigation (Simple link to the other HTML file)
goToWatchlistBtn.addEventListener('click', () => {
    window.location.href = 'watchlist.html';
});

// Close modal (FIX 3: Unlock scroll on close)
document.querySelector('.close-btn').addEventListener('click', () => {
    animeModal.style.display = 'none';
    document.body.classList.remove('modal-open');
});

animeModal.addEventListener('click', (e) => {
    if (e.target === animeModal) {
        animeModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});

// Initial call
loadSeasonalAnime();