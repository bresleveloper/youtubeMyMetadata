// Global variable to store last fetched results
let lastResults = null;

// Load README and saved values when the page loads
window.addEventListener('load', () => {
    loadReadme();
    loadSavedValues();
});

// Load saved values from localStorage
function loadSavedValues() {
    const savedApiKey = localStorage.getItem('youtube_api_key');
    const savedChannelId = localStorage.getItem('youtube_channel_id');

    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    if (savedChannelId) {
        document.getElementById('channelId').value = savedChannelId;
    }
}

// Save API Key to localStorage
document.getElementById('saveApiKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (apiKey) {
        localStorage.setItem('youtube_api_key', apiKey);
        // Visual feedback
        const icon = document.getElementById('saveApiKey');
        icon.style.transform = 'scale(1.3)';
        icon.style.opacity = '1';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    } else {
        alert('Please enter an API Key before saving');
    }
});

// Save Channel ID to localStorage
document.getElementById('saveChannelId').addEventListener('click', () => {
    const channelId = document.getElementById('channelId').value.trim();
    if (channelId) {
        localStorage.setItem('youtube_channel_id', channelId);
        // Visual feedback
        const icon = document.getElementById('saveChannelId');
        icon.style.transform = 'scale(1.3)';
        icon.style.opacity = '1';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    } else {
        alert('Please enter a Channel ID before saving');
    }
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

    // Get inputs
    const apiKey = document.getElementById('apiKey').value.trim();
    const channelId = document.getElementById('channelId').value.trim();

    // Check what's missing
    const missingInputs = [];
    if (!apiKey) missingInputs.push('YouTube API V3 Key');
    if (!channelId) missingInputs.push('YouTube Channel ID');

    // If either input is missing, show example data
    if (missingInputs.length > 0) {
        const missingMessage = `Missing: ${missingInputs.join(' and ')}. Showing example data structure below.`;

        // Get checkbox states to determine what examples to show
        const fetchPlaylists = document.getElementById('playlists').checked;
        const fetchVideos = document.getElementById('videos').checked;
        const includePlaylistDesc = document.getElementById('playlistsDesc').checked;
        const includeVideoDesc = document.getElementById('videosDesc').checked;

        if (!fetchPlaylists && !fetchVideos) {
            alert('Please select at least one option (Playlists or Videos)');
            return;
        }

        // Get example data and filter based on selections
        const examples = getExamples();
        const exampleResults = {
            playlists: fetchPlaylists ? examples.playlists.map(p => {
                if (!includePlaylistDesc) {
                    const { description, ...rest } = p;
                    return rest;
                }
                return p;
            }) : [],
            videos: fetchVideos ? examples.videos.map(v => {
                if (!includeVideoDesc) {
                    const { description, ...rest } = v;
                    return rest;
                }
                return v;
            }) : []
        };

        lastResults = exampleResults;
        displayResults(exampleResults, missingMessage);
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
            results.playlists = await getUserPlaylists(apiKey, channelId, includePlaylistDesc);
        }

        // Fetch videos if requested
        if (fetchVideos) {
            results.videos = await getUserVideos(apiKey, channelId, includeVideoDesc, includeShorts);
        }

        lastResults = results;
        displayResults(results);

    } catch (error) {
        resultsContent.innerHTML = `<p style="color: #ff4d4d;">Error: ${error.message}</p>`;
        console.error('Error fetching YouTube data:', error);
    }
});

// Display results as tables
function displayResults(data, warningMessage = null) {
    const resultsContent = document.getElementById('resultsContent');
    let html = '';

    // Show warning message if provided
    if (warningMessage) {
        html += `<div style="background-color: #ff4d9f; color: #1a1a2e; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-weight: bold;">
            ⚠️ ${warningMessage}
        </div>`;
    }

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

// Load and render README.md
async function loadReadme() {
    const readmeContent = document.getElementById('readmeContent');

    try {
        const response = await fetch('README.md');
        if (!response.ok) {
            throw new Error('Failed to load README.md');
        }

        const markdown = await response.text();
        readmeContent.innerHTML = parseMarkdown(markdown);
    } catch (error) {
        readmeContent.innerHTML = '<p style="color: #ff4d4d;">Failed to load README</p>';
        console.error('Error loading README:', error);
    }
}

// Simple markdown parser
function parseMarkdown(markdown) {
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Convert line breaks to paragraphs
    const lines = html.split('\n');
    let inList = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            result.push('');
            continue;
        }

        // Check if it's a header or list item
        if (line.startsWith('<h') || line.startsWith('<li>') || line.startsWith('<ul>') || line.startsWith('</ul>')) {
            if (line.startsWith('<li>') || line.startsWith('<ul>')) {
                inList = true;
            }
            if (line.startsWith('</ul>')) {
                inList = false;
            }
            result.push(line);
        } else if (!inList && !line.startsWith('<')) {
            // Wrap text in paragraphs
            result.push('<p>' + line + '</p>');
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}
