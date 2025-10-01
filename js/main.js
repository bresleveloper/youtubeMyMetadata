// Global variable to store last fetched results
let lastResults = null;

// Initialize Google Auth when the page loads
window.addEventListener('load', () => {
    // Wait for Google API to load
    const checkGoogleLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
            clearInterval(checkGoogleLoaded);
            initializeGoogleAuth();
        }
    }, 100);
});

// Auth success callback
function onAuthSuccess() {
    document.getElementById('signInContainer').style.display = 'none';
    document.getElementById('signedInContainer').style.display = 'block';
    document.getElementById('getMetadataBtn').disabled = false;
}

// Auth error callback
function onAuthError(error) {
    console.error('Authentication error:', error);
    alert('Authentication failed. Please try again.');
}

// Sign out callback
function onSignOut() {
    document.getElementById('signInContainer').style.display = 'block';
    document.getElementById('signedInContainer').style.display = 'none';
    document.getElementById('getMetadataBtn').disabled = true;
    document.getElementById('resultsContent').innerHTML = '';
    lastResults = null;
}

// Sign In Button
document.getElementById('signInBtn').addEventListener('click', () => {
    signIn();
});

// Sign Out Button
document.getElementById('signOutBtn').addEventListener('click', () => {
    signOut();
});

// Check All functionality
document.getElementById('checkAll').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.querySelectorAll('.content-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

// Update Check All when individual checkboxes change
document.querySelectorAll('.content-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const allChecked = Array.from(document.querySelectorAll('.content-checkbox'))
            .every(cb => cb.checked);
        document.getElementById('checkAll').checked = allChecked;
    });
});

// Get Metadata Button
document.getElementById('getMetadataBtn').addEventListener('click', async () => {
    const resultsContent = document.getElementById('resultsContent');

    // Check if signed in
    if (!isSignedIn()) {
        alert('Please sign in first');
        return;
    }

    // Get checkbox states
    const fetchPlaylists = document.getElementById('playlists').checked;
    const fetchVideos = document.getElementById('videos').checked;
    const includePlaylistDesc = document.getElementById('playlistsDesc').checked;
    const includeVideoDesc = document.getElementById('videosDesc').checked;
    const includeShorts = document.getElementById('videosShorts').checked;

    if (!fetchPlaylists && !fetchVideos) {
        alert('Please select at least one option (Playlists or Videos)');
        return;
    }

    // Show loading
    resultsContent.innerHTML = '<p style="text-align: center; color: #ff4d9f;">Loading... Please wait</p>';

    try {
        const results = {
            playlists: [],
            videos: []
        };

        // Fetch playlists if requested
        if (fetchPlaylists) {
            results.playlists = await getUserPlaylists(includePlaylistDesc);
        }

        // Fetch videos if requested
        if (fetchVideos) {
            results.videos = await getUserVideos(includeVideoDesc, includeShorts);
        }

        lastResults = results;
        displayResults(results);

    } catch (error) {
        resultsContent.innerHTML = `<p style="color: #ff4d4d;">Error: ${error.message}</p>`;
        console.error('Error fetching YouTube data:', error);

        // If it's an auth error, prompt to sign in again
        if (error.message.includes('401') || error.message.includes('auth')) {
            alert('Authentication expired. Please sign in again.');
            signOut();
        }
    }
});

// Display results as tables
function displayResults(data) {
    const resultsContent = document.getElementById('resultsContent');
    let html = '';

    // Display Playlists
    if (data.playlists && data.playlists.length > 0) {
        html += '<h3 class="table-heading">Playlists</h3>';
        html += '<table class="results-table">';
        html += '<thead><tr>';
        html += '<th>ID</th>';
        html += '<th>Title</th>';
        html += '<th>Item Count</th>';
        if (data.playlists[0].description !== undefined) {
            html += '<th>Description</th>';
        }
        html += '</tr></thead><tbody>';

        data.playlists.forEach(playlist => {
            html += '<tr>';
            html += `<td>${escapeHtml(playlist.id)}</td>`;
            html += `<td>${escapeHtml(playlist.title)}</td>`;
            html += `<td>${playlist.itemCount}</td>`;
            if (playlist.description !== undefined) {
                html += `<td class="description-cell">${escapeHtml(playlist.description)}</td>`;
            }
            html += '</tr>';
        });

        html += '</tbody></table>';
    }

    // Display Videos
    if (data.videos && data.videos.length > 0) {
        html += '<h3 class="table-heading">Videos</h3>';
        html += '<table class="results-table">';
        html += '<thead><tr>';
        html += '<th>ID</th>';
        html += '<th>Title</th>';
        html += '<th>Published At</th>';
        if (data.videos[0].description !== undefined) {
            html += '<th>Description</th>';
        }
        html += '</tr></thead><tbody>';

        data.videos.forEach(video => {
            html += '<tr>';
            html += `<td>${escapeHtml(video.id)}</td>`;
            html += `<td>${escapeHtml(video.title)}</td>`;
            html += `<td>${new Date(video.publishedAt).toLocaleString()}</td>`;
            if (video.description !== undefined) {
                html += `<td class="description-cell">${escapeHtml(video.description)}</td>`;
            }
            html += '</tr>';
        });

        html += '</tbody></table>';
    }

    if (!html) {
        html = '<p style="text-align: center; color: #ff4d9f;">No results found</p>';
    }

    resultsContent.innerHTML = html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Download JSON Button
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!lastResults) {
        alert('No data to download. Please fetch data first.');
        return;
    }

    // Create JSON blob
    const jsonStr = JSON.stringify(lastResults, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    a.download = `youtube-metadata-${date}.json`;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
