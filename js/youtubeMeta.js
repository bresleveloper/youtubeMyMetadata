/**
 * YouTube Metadata Fetcher
 * Client-side JavaScript for fetching YouTube playlists and videos using YouTube Data API V3
 * Uses API Key for authentication
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Get all playlists for a specific channel
 * @param {string} apiKey - The YouTube Data API v3 Key
 * @param {string} channelId - The YouTube channel ID
 * @param {boolean} includeDescription - Whether to include description in results
 * @returns {Promise<Array>} Array of playlist objects
 */
async function getUserPlaylists(apiKey, channelId, includeDescription = false) {
    if (!apiKey) {
        throw new Error('API Key is required.');
    }
    if (!channelId) {
        throw new Error('Channel ID is required.');
    }

    const allPlaylists = [];
    let pageToken = null;

    const parts = includeDescription ? 'snippet,contentDetails' : 'snippet,contentDetails';

    do {
        const url = new URL(`${BASE_URL}/playlists`);
        url.searchParams.append('part', parts);
        url.searchParams.append('channelId', channelId);
        url.searchParams.append('maxResults', '50');
        url.searchParams.append('key', apiKey);

        if (pageToken) {
            url.searchParams.append('pageToken', pageToken);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        data.items.forEach(playlist => {
            const playlistObj = {
                id: playlist.id,
                title: playlist.snippet.title,
                itemCount: playlist.contentDetails.itemCount || 0
            };

            if (includeDescription) {
                playlistObj.description = playlist.snippet.description;
            }

            allPlaylists.push(playlistObj);
        });

        pageToken = data.nextPageToken;

    } while (pageToken);

    return allPlaylists;
}

/**
 * Get all videos for a specific channel
 * @param {string} apiKey - The YouTube Data API v3 Key
 * @param {string} channelId - The YouTube channel ID
 * @param {boolean} includeDescription - Whether to include description in results
 * @param {boolean} includeShorts - Whether to include YouTube Shorts (videos ≤60s)
 * @returns {Promise<Array>} Array of video objects
 */
async function getUserVideos(apiKey, channelId, includeDescription = false, includeShorts = true) {
    if (!apiKey) {
        throw new Error('API Key is required.');
    }
    if (!channelId) {
        throw new Error('Channel ID is required.');
    }

    // Step 1: Get channel's uploads playlist ID
    const channelUrl = new URL(`${BASE_URL}/channels`);
    channelUrl.searchParams.append('part', 'contentDetails');
    channelUrl.searchParams.append('id', channelId);
    channelUrl.searchParams.append('key', apiKey);

    const channelResponse = await fetch(channelUrl.toString());

    if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        throw new Error(`YouTube API error: ${channelResponse.status} - ${errorData.error?.message || channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
        throw new Error('No channel found with the provided Channel ID');
    }

    // Step 2: Get uploads playlist ID
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 3: Get all videos from uploads playlist
    const allVideos = [];
    let pageToken = null;

    const parts = includeDescription ? 'snippet,contentDetails' : 'snippet,contentDetails';

    do {
        const playlistUrl = new URL(`${BASE_URL}/playlistItems`);
        playlistUrl.searchParams.append('part', parts);
        playlistUrl.searchParams.append('playlistId', uploadsPlaylistId);
        playlistUrl.searchParams.append('maxResults', '50');
        playlistUrl.searchParams.append('key', apiKey);

        if (pageToken) {
            playlistUrl.searchParams.append('pageToken', pageToken);
        }

        const playlistResponse = await fetch(playlistUrl.toString());

        if (!playlistResponse.ok) {
            const errorData = await playlistResponse.json();
            throw new Error(`YouTube API error: ${playlistResponse.status} - ${errorData.error?.message || playlistResponse.statusText}`);
        }

        const playlistData = await playlistResponse.json();

        // Collect video IDs for duration check if needed
        const videoIds = playlistData.items.map(item => item.contentDetails.videoId);

        // Step 4: If we need to filter shorts, get video durations
        let videoDurations = {};
        if (!includeShorts) {
            const videosUrl = new URL(`${BASE_URL}/videos`);
            videosUrl.searchParams.append('part', 'contentDetails');
            videosUrl.searchParams.append('id', videoIds.join(','));
            videosUrl.searchParams.append('key', apiKey);

            const videosResponse = await fetch(videosUrl.toString());

            if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                videosData.items.forEach(video => {
                    videoDurations[video.id] = parseDuration(video.contentDetails.duration);
                });
            }
        }

        // Step 5: Process items
        playlistData.items.forEach(item => {
            const videoId = item.contentDetails.videoId;

            // Filter out shorts if requested
            if (!includeShorts && videoDurations[videoId] !== undefined) {
                if (videoDurations[videoId] <= 60) {
                    return; // Skip this video (it's a short)
                }
            }

            const videoObj = {
                id: videoId,
                title: item.snippet.title,
                publishedAt: item.snippet.publishedAt
            };

            if (includeDescription) {
                videoObj.description = item.snippet.description;
            }

            allVideos.push(videoObj);
        });

        pageToken = playlistData.nextPageToken;

    } while (pageToken);

    return allVideos;
}

/**
 * Parse ISO 8601 duration to seconds
 * @param {string} duration - Duration in ISO 8601 format (e.g., "PT4M13S")
 * @returns {number} Duration in seconds
 */
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get example data structures for playlists and videos
 * @returns {Object} Object with example playlists and videos arrays
 */
function getExamples() {
    return {
        playlists: [
            {
                id: "PLxxxxxxxxxxxxxxxxxxx1",
                title: "Lorem Ipsum Coding Tutorials",
                itemCount: 42,
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            },
            {
                id: "PLxxxxxxxxxxxxxxxxxxx2",
                title: "Dolor Sit Amet Reviews",
                itemCount: 18,
                description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            }
        ],
        videos: [
            {
                id: "xxxxxxxxxxx1",
                title: "Lorem Ipsum: Introduction to Web Development",
                publishedAt: "2025-01-15T10:30:00Z",
                description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
            },
            {
                id: "xxxxxxxxxxx2",
                title: "Consectetur Adipiscing: Advanced JavaScript Patterns",
                publishedAt: "2025-02-20T14:45:00Z",
                description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis."
            }
        ]
    };
}
