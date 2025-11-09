// renderer_watchlist.js

// DOM Elements
const goToHomeBtn = document.getElementById('goToHomeBtn');
const watchlistContainer = document.getElementById('watchlistContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyMessage = document.getElementById('emptyMessage');
const updateModal = document.getElementById('updateModal');
const updateModalBody = document.getElementById('updateModalBody');
const closeModalBtn = document.querySelector('.close-btn-update');

// Utility Function (Same as renderer_home.js)
function safeText(text) {
    if (typeof text !== 'string') {
        return text;
    }
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


// --- CRUD Operation: READ (Load Watchlist) ---

async function loadWatchlist() {
    loadingIndicator.style.display = 'block';
    watchlistContainer.innerHTML = '';
    
    // READ Operation: Call the main process via API to get the local list
    const watchlist = await window.api.getWatchlist(); 

    loadingIndicator.style.display = 'none';

    if (watchlist.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    watchlist.forEach(anime => {
        watchlistContainer.appendChild(createWatchlistItem(anime));
    });
}




function createWatchlistItem(anime) {
    const item = document.createElement('div');
    item.className = 'watchlist-item';
    item.setAttribute('data-mal-id', anime.id);
    
    const progressText = anime.isManga ? 
        'Chapter ' + anime.watchedProgress + ' of ' + anime.totalUnits :
        'Episode ' + anime.watchedProgress + ' of ' + anime.totalUnits;
    
    const completionPercentage = anime.totalUnits && anime.totalUnits > 0 ? 
        Math.floor((anime.watchedProgress / anime.totalUnits) * 100) : 0;
        
    item.innerHTML = 
        '<img src="' + anime.image_url + '" alt="' + safeText(anime.title) + '" class="watchlist-image">' +
        '<div class="watchlist-info">' +
            '<h3>' + safeText(anime.title) + '</h3>' +
            '<p class="watchlist-meta">Score: ' + safeText(anime.score) + ' | Type: ' + safeText(anime.type) + '</p>' +
            
            // Progress Bar
            '<div class="progress-bar-container">' +
                '<div class="progress-bar-fill" style="width:' + completionPercentage + '%"></div>' +
                '<span class="progress-text">' + progressText + ' (' + completionPercentage + '%)</span>' +
            '</div>' +
            
            '<p class="watchlist-review">Review: ' + (anime.review ? safeText(anime.review) : 'No review yet.') + '</p>' +
        '</div>' +
        '<div class="watchlist-actions">' +
            // UPDATE Button
            '<button class="btn btn-update" data-id="' + anime.id + '">Edit Progress/Review</button>' +
            // DELETE Button
            '<button class="btn btn-delete" data-id="' + anime.id + '">Remove</button>' +
        '</div>';

    // Add event listeners for the CRUD operations
    item.querySelector('.btn-update').addEventListener('click', () => showUpdateModal(anime));
    item.querySelector('.btn-delete').addEventListener('click', (e) => deleteWatchlistItem(e.target.dataset.id, anime.title));
    
    return item;
}


// --- CRUD Operation: UPDATE (Edit Progress/Review) ---

function showUpdateModal(anime) {
    updateModalBody.innerHTML = 
        '<p>Updating: ' + safeText(anime.title) + '</p>' +
        '<form id="updateForm">' +
            // Progress Input
            '<label for="progressInput">Progress (' + safeText(anime.progressUnit) + 's Watched):</label>' +
            '<input type="number" id="progressInput" min="0" max="' + safeText(anime.totalUnits) + '" value="' + safeText(anime.watchedProgress) + '" required>' +
            '<p style="font-size: 0.9em; color: #666;">Total ' + anime.totalUnits + ' ' + anime.progressUnit + 's</p>' +
            
            // Review Input
            '<label for="reviewInput">Your Review/Notes:</label>' +
            '<textarea id="reviewInput" rows="4">' + safeText(anime.review) + '</textarea>' +
            
            '<button type="submit" class="btn btn-save">Save Changes</button>' +
        '</form>';

    document.getElementById('updateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newProgress = parseInt(document.getElementById('progressInput').value, 10);
        const newReview = document.getElementById('reviewInput').value;
        
        // Final UPDATE call to the main process
        updateWatchlistItem(anime.id, newProgress, newReview, anime.title);
    });

    updateModal.style.display = 'block';
}

async function updateWatchlistItem(id, progress, review, title) {
    const updateData = { 
        watchedProgress: progress, 
        review: review 
    };
    
    // UPDATE Operation: Call the main process via API
    const result = await window.api.updateWatchlistItem(id, updateData);

    if (result.success) {
        alert(title + ' updated successfully!');
        updateModal.style.display = 'none';
        loadWatchlist(); // Reload the list to show changes
    } else {
        alert('Update failed: ' + result.message);
    }
}


// --- CRUD Operation: DELETE (Remove Item) ---

async function deleteWatchlistItem(id, title) {
    if (!confirm('Are you sure you want to remove ' + title + ' from your watchlist?')) {
        return;
    }
    
    // DELETE Operation: Call the main process via API
    const result = await window.api.deleteFromWatchlist(parseInt(id, 10));

    if (result.success) {
        alert(title + ' was successfully removed.');
        loadWatchlist(); // Reload the list
    } else {
        alert('Removal failed: ' + result.message);
    }
}


// --- Event Listeners and Initial Load ---

// Navigation back to Home/Discovery
goToHomeBtn.addEventListener('click', () => {window.location.href = 'index.html';
});

// Close update modal
closeModalBtn.addEventListener('click', () => updateModal.style.display = 'none');
updateModal.addEventListener('click', (e) => {
    if (e.target === updateModal) {
        updateModal.style.display = 'none';
    }
});


// Start the READ operation when the page loads
loadWatchlist();