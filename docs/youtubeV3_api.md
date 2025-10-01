# YouTube Data API V3 - Comprehensive Development Guide

This documentation provides a complete reference for integrating YouTube Data API V3 to retrieve metadata about videos, playlists, shorts, and other YouTube resources.

## Table of Contents
- [Overview](#overview)
- [Authentication Setup](#authentication-setup)
- [Core Endpoints](#core-endpoints)
- [Shorts Detection](#shorts-detection)
- [Quota Management](#quota-management)
- [C# Implementation Examples](#c-implementation-examples)
- [Quick Reference](#quick-reference)

---

## Overview

**Base URL:** `https://www.googleapis.com/youtube/v3/`

**Default Quota:** 10,000 units per day (resets at midnight Pacific Time)

**Latest Update:** August 28, 2025

### Key Features
- Retrieve video metadata (title, description, thumbnails, statistics)
- Access playlist information and items
- Get channel details
- Search for videos and channels
- Manage playlists (with proper authorization)

---

## Authentication Setup

### Option 1: API Key (Public Data)
Use API keys for requests that access public data without user-specific information.

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > API Key**
5. (Optional) Click **Restrict Key** for production use

**Usage:**
```
GET https://www.googleapis.com/youtube/v3/videos?part=snippet&id=VIDEO_ID&key=YOUR_API_KEY
```

### Option 2: OAuth 2.0 (Private User Data)
Required for accessing private user data or performing insert/update/delete operations.

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click **Create Credentials > OAuth client ID**
4. Choose application type (Web application/Desktop/Mobile)
5. Configure authorized redirect URIs (e.g., `http://localhost:8090/login/oauth2/code/google`)
6. Download client credentials

**Usage:**
```
GET /youtube/v3/channels?part=snippet&mine=true HTTP/1.1
Host: www.googleapis.com
Authorization: Bearer ACCESS_TOKEN
```

**Important Notes:**
- Service Account flow is NOT supported by YouTube Data API
- Every request must include either an API key OR OAuth 2.0 token
- OAuth 2.0 is mandatory for `mine=true` parameter and private data access

---

## Core Endpoints

### 1. videos.list - Get Video Metadata

**Endpoint:** `GET https://www.googleapis.com/youtube/v3/videos`

**Quota Cost:** 1 unit per request

**Required Parameters:**
- `part` - Comma-separated list of video resource properties
- One filter: `id`, `chart`, or `myRating`

**Available Parts:**
- `snippet` - Title, description, thumbnails, tags, categoryId, publishedAt
- `contentDetails` - Duration, dimension, definition, caption
- `statistics` - Views, likes, comments, favorites
- `status` - Upload status, privacy status, license
- `topicDetails` - Topic categories and tags
- `player` - Embedded player HTML
- `recordingDetails` - Recording date and location
- `liveStreamingDetails` - Live stream metadata
- `localizations` - Localized metadata
- `fileDetails` - Technical file details (owner only)
- `processingDetails` - Processing status (owner only)
- `suggestions` - Optimization suggestions (owner only)

**Optional Parameters:**
- `id` - Comma-separated video IDs (max 50)
- `maxResults` - Items per page (1-50, default: 5)
- `pageToken` - Page navigation token
- `regionCode` - Country code for regional content
- `hl` - Language for localized metadata
- `videoCategoryId` - Filter by category

**Example Request:**
```
GET https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=VIDEO_ID&key=YOUR_API_KEY
```

**Response Structure:**
```json
{
  "kind": "youtube#videoListResponse",
  "etag": "etag_value",
  "pageInfo": {
    "totalResults": 1,
    "resultsPerPage": 1
  },
  "items": [
    {
      "kind": "youtube#video",
      "id": "VIDEO_ID",
      "snippet": {
        "title": "Video Title",
        "description": "Video Description",
        "publishedAt": "2025-01-15T10:00:00Z",
        "channelId": "CHANNEL_ID",
        "channelTitle": "Channel Name",
        "thumbnails": {
          "default": { "url": "...", "width": 120, "height": 90 },
          "medium": { "url": "...", "width": 320, "height": 180 },
          "high": { "url": "...", "width": 480, "height": 360 },
          "standard": { "url": "...", "width": 640, "height": 480 },
          "maxres": { "url": "...", "width": 1280, "height": 720 }
        },
        "tags": ["tag1", "tag2"],
        "categoryId": "22"
      },
      "contentDetails": {
        "duration": "PT4M13S",
        "dimension": "2d",
        "definition": "hd",
        "caption": "true",
        "licensedContent": true,
        "contentRating": {},
        "projection": "rectangular"
      },
      "statistics": {
        "viewCount": "12345",
        "likeCount": "678",
        "commentCount": "90"
      }
    }
  ]
}
```

---

### 2. playlistItems.list - Get Playlist Videos

**Endpoint:** `GET https://www.googleapis.com/youtube/v3/playlistItems`

**Quota Cost:** 1 unit per request

**Required Parameters:**
- `part` - Resource properties to include
- One filter: `id` or `playlistId`

**Available Parts:**
- `snippet` - Title, description, thumbnails, channel info, video info
- `contentDetails` - Video ID, start/end position
- `status` - Privacy status
- `id` - Playlist item ID

**Optional Parameters:**
- `playlistId` - Playlist ID to retrieve items from
- `maxResults` - Items per page (0-50, default: 5)
- `pageToken` - Page navigation token
- `videoId` - Filter by specific video

**Example Request:**
```
GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=PLAYLIST_ID&maxResults=50&key=YOUR_API_KEY
```

**Pagination Example:**
```
# First request
GET .../playlistItems?part=snippet&playlistId=PLxxx&maxResults=50

# Use nextPageToken from response
GET .../playlistItems?part=snippet&playlistId=PLxxx&maxResults=50&pageToken=NEXT_PAGE_TOKEN
```

**Response Structure:**
```json
{
  "kind": "youtube#playlistItemListResponse",
  "nextPageToken": "NEXT_TOKEN",
  "prevPageToken": "PREV_TOKEN",
  "pageInfo": {
    "totalResults": 150,
    "resultsPerPage": 50
  },
  "items": [
    {
      "kind": "youtube#playlistItem",
      "id": "PLAYLIST_ITEM_ID",
      "snippet": {
        "publishedAt": "2025-01-15T10:00:00Z",
        "channelId": "CHANNEL_ID",
        "title": "Video Title",
        "description": "Video Description",
        "thumbnails": { /* ... */ },
        "channelTitle": "Channel Name",
        "playlistId": "PLAYLIST_ID",
        "position": 0,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "VIDEO_ID"
        }
      },
      "contentDetails": {
        "videoId": "VIDEO_ID",
        "startAt": "PT1M5S",
        "endAt": "PT1M35S",
        "note": "Custom note"
      }
    }
  ]
}
```

---

### 3. playlists.list - Get User Playlists

**Endpoint:** `GET https://www.googleapis.com/youtube/v3/playlists`

**Quota Cost:** 1 unit per request

**Required Parameters:**
- `part` - Resource properties to include
- One filter: `id`, `channelId`, or `mine`

**Available Parts:**
- `snippet` - Title, description, thumbnails, channel info
- `contentDetails` - Item count
- `status` - Privacy status
- `player` - Embedded player
- `localizations` - Localized metadata
- `id` - Playlist ID

**Optional Parameters:**
- `channelId` - Get playlists for specific channel
- `id` - Comma-separated playlist IDs
- `mine` - Get authenticated user's playlists (requires OAuth)
- `maxResults` - Items per page (0-50, default: 5)
- `pageToken` - Page navigation token
- `hl` - Language for localized metadata

**Example Request (User's Playlists):**
```
GET https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true
Authorization: Bearer ACCESS_TOKEN
```

**Example Request (Channel's Playlists):**
```
GET https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=CHANNEL_ID&maxResults=25&key=YOUR_API_KEY
```

**Response Structure:**
```json
{
  "kind": "youtube#playlistListResponse",
  "etag": "etag_value",
  "nextPageToken": "NEXT_TOKEN",
  "pageInfo": {
    "totalResults": 10,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#playlist",
      "id": "PLAYLIST_ID",
      "snippet": {
        "publishedAt": "2025-01-01T00:00:00Z",
        "channelId": "CHANNEL_ID",
        "title": "Playlist Title",
        "description": "Playlist Description",
        "thumbnails": { /* ... */ },
        "channelTitle": "Channel Name",
        "localized": {
          "title": "Localized Title",
          "description": "Localized Description"
        }
      },
      "contentDetails": {
        "itemCount": 42
      }
    }
  ]
}
```

---

### 4. channels.list - Get Channel Information

**Endpoint:** `GET https://www.googleapis.com/youtube/v3/channels`

**Quota Cost:** 1 unit per request

**Required Parameters:**
- `part` - Resource properties to include
- One filter: `id`, `mine`, or `forUsername`

**Available Parts:**
- `snippet` - Title, description, thumbnails, country
- `contentDetails` - Related playlists (uploads, favorites, etc.)
- `statistics` - Subscriber count, video count, view count
- `brandingSettings` - Channel branding
- `status` - Privacy status, made for kids
- `topicDetails` - Topic categories

**Optional Parameters:**
- `id` - Comma-separated channel IDs
- `mine` - Get authenticated user's channel (requires OAuth)
- `forUsername` - Get channel by username

**Example Request:**
```
GET https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=CHANNEL_ID&key=YOUR_API_KEY
```

**Getting Channel's Uploads Playlist:**
```json
{
  "items": [
    {
      "contentDetails": {
        "relatedPlaylists": {
          "uploads": "UU_PLAYLIST_ID",
          "favorites": "FL_PLAYLIST_ID",
          "likes": "LL_PLAYLIST_ID"
        }
      }
    }
  ]
}
```

---

### 5. search.list - Search Videos/Channels/Playlists

**Endpoint:** `GET https://www.googleapis.com/youtube/v3/search`

**Quota Cost:** 100 units per request (EXPENSIVE!)

**Required Parameters:**
- `part` - Only `snippet` supported for search

**Optional Parameters:**
- `q` - Search query
- `type` - Resource type: `video`, `channel`, `playlist`
- `channelId` - Search within specific channel
- `maxResults` - Results per page (0-50, default: 5)
- `order` - Sort order: `date`, `rating`, `relevance`, `title`, `viewCount`
- `publishedAfter` - RFC 3339 timestamp
- `publishedBefore` - RFC 3339 timestamp
- `videoDuration` - `short`, `medium`, `long`, `any`
- `videoDefinition` - `high`, `standard`, `any`

**Important:**
- Search only returns IDs and basic snippet data
- Use `videos.list` with returned IDs to get full details (contentDetails, statistics)
- Avoid search when possible - use more efficient endpoints

**Example:**
```
# Step 1: Search (costs 100 units)
GET .../search?part=snippet&q=cooking&type=video&maxResults=10&key=API_KEY

# Step 2: Get full details (costs 1 unit)
GET .../videos?part=contentDetails,statistics&id=VIDEO_ID1,VIDEO_ID2&key=API_KEY
```

---

## Shorts Detection

YouTube Data API V3 does **not** have an official field to identify Shorts. Here are proven workarounds:

### Method 1: Duration Check (Simple but Imperfect)
Shorts have a maximum duration of 60 seconds.

```csharp
// Parse ISO 8601 duration
string duration = "PT0M59S"; // From contentDetails.duration
bool isPotentialShort = ParseDuration(duration) <= 60;
```

**Limitations:** Not all videos ≤60s are Shorts, and this doesn't guarantee accuracy.

### Method 2: UUSH Playlist Method (Most Reliable)
Replace `UC` in channel ID with `UUSH` to get Shorts-only playlist.

```
Channel ID:  UC1234567890abcdefghij
Shorts Playlist: UUSH1234567890abcdefghij
```

**Implementation:**
1. Get channel ID from video
2. Replace `UC` with `UUSH`
3. Use `playlistItems.list` to check if video exists in Shorts playlist
4. If found → it's a Short

```csharp
string channelId = "UC1234567890abcdefghij";
string shortsPlaylistId = "UUSH" + channelId.Substring(2);

// Query playlistItems.list with videoId filter
bool isShort = CheckIfVideoInPlaylist(shortsPlaylistId, videoId);
```

### Method 3: URL Validation (HTTP Request)
Check if `/shorts/` URL returns 200 without redirect.

```csharp
string videoId = "VIDEO_ID";
string shortsUrl = $"https://www.youtube.com/shorts/{videoId}";

HttpResponseMessage response = await httpClient.SendAsync(
    new HttpRequestMessage(HttpMethod.Head, shortsUrl)
);

bool isShort = response.StatusCode == HttpStatusCode.OK &&
               response.RequestMessage.RequestUri.AbsolutePath.Contains("/shorts/");
```

### Recommended Approach
Combine methods for best accuracy:
1. Check duration (< 60s) as initial filter
2. Use UUSH playlist method for verification
3. Cache results to avoid repeated API calls

---

## Quota Management

### Quota Costs by Endpoint

| Endpoint | Method | Cost | Notes |
|----------|--------|------|-------|
| `videos.list` | GET | 1 | Most efficient for video data |
| `playlistItems.list` | GET | 1 | Efficient for playlist traversal |
| `playlists.list` | GET | 1 | Low cost for playlist metadata |
| `channels.list` | GET | 1 | Efficient for channel data |
| `search.list` | GET | 100 | **VERY EXPENSIVE** - avoid when possible |
| `videos.insert` | POST | 1600 | Video upload operation |
| `playlists.insert` | POST | 50 | Create playlist |
| `playlistItems.insert` | POST | 50 | Add video to playlist |

### Optimization Strategies

#### 1. Use Specific Endpoints Instead of Search
```
❌ BAD: search.list (100 units) → videos.list (1 unit) = 101 units
✅ GOOD: videos.list with IDs (1 unit) = 1 unit
```

#### 2. Request Only Needed Parts
```
❌ BAD: ?part=snippet,contentDetails,statistics,status,topicDetails
✅ GOOD: ?part=snippet,statistics
```

#### 3. Use `fields` Parameter for Partial Responses
```
?part=snippet&fields=items(id,snippet(title,description))
```

#### 4. Batch Video Requests (Max 50 IDs)
```
# Single request instead of 50 separate requests
GET .../videos?part=snippet&id=ID1,ID2,ID3,...,ID50&key=API_KEY
```

#### 5. Implement Caching
```csharp
// Cache video metadata for 1 hour
var cacheKey = $"video_{videoId}";
var cached = cache.Get<VideoMetadata>(cacheKey);
if (cached != null) return cached;

var video = await FetchFromAPI(videoId);
cache.Set(cacheKey, video, TimeSpan.FromHours(1));
```

#### 6. Pagination Strategy
```csharp
// Fetch all playlist items efficiently
var allItems = new List<PlaylistItem>();
string nextPageToken = null;

do {
    var response = await GetPlaylistItems(playlistId, nextPageToken, maxResults: 50);
    allItems.AddRange(response.Items);
    nextPageToken = response.NextPageToken;
} while (nextPageToken != null);
```

#### 7. ETags for Conditional Requests
```csharp
// Store etag from previous response
string etag = response.Etag;

// Use in next request
request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue(etag));
// Returns 304 Not Modified if unchanged (no quota cost)
```

### Quota Increase Request
Default quota: 10,000 units/day

To request increase:
1. Complete compliance audit via [YouTube API Services Audit Form](https://support.google.com/youtube/contact/yt_api_form)
2. Demonstrate compliance with Terms of Service
3. Provide usage justification
4. Wait for Google approval (can take weeks)

### Daily Quota Reset
- Resets at **midnight Pacific Time (PT)**
- Plan batch operations accordingly
- Monitor usage in Google Cloud Console

---

## C# Implementation Examples

### Setup - Install NuGet Packages
```bash
Install-Package Google.Apis.YouTube.v3
Install-Package Google.Apis.Auth
```

### 1. Initialize YouTube Service (API Key)

```csharp
using Google.Apis.YouTube.v3;
using Google.Apis.Services;

public class YouTubeService
{
    private readonly YouTubeService _youtubeService;
    private const string API_KEY = "YOUR_API_KEY";

    public YouTubeApiService()
    {
        _youtubeService = new YouTubeService(new BaseClientService.Initializer()
        {
            ApiKey = API_KEY,
            ApplicationName = "YouTubeMetadataApp"
        });
    }
}
```

### 2. Get Video Metadata

```csharp
public async Task<VideoMetadata> GetVideoMetadataAsync(string videoId)
{
    var videoRequest = _youtubeService.Videos.List("snippet,contentDetails,statistics");
    videoRequest.Id = videoId;

    var videoResponse = await videoRequest.ExecuteAsync();

    if (videoResponse.Items.Count == 0)
        return null;

    var video = videoResponse.Items[0];

    return new VideoMetadata
    {
        VideoId = video.Id,
        Title = video.Snippet.Title,
        Description = video.Snippet.Description,
        PublishedAt = video.Snippet.PublishedAt,
        ChannelId = video.Snippet.ChannelId,
        ChannelTitle = video.Snippet.ChannelTitle,
        ThumbnailUrl = video.Snippet.Thumbnails.High.Url,
        Duration = video.ContentDetails.Duration,
        ViewCount = video.Statistics.ViewCount,
        LikeCount = video.Statistics.LikeCount,
        CommentCount = video.Statistics.CommentCount,
        Tags = video.Snippet.Tags?.ToList() ?? new List<string>()
    };
}
```

### 3. Get All Videos from Playlist

```csharp
public async Task<List<PlaylistVideo>> GetPlaylistVideosAsync(string playlistId)
{
    var allVideos = new List<PlaylistVideo>();
    string nextPageToken = null;

    do
    {
        var playlistRequest = _youtubeService.PlaylistItems.List("snippet,contentDetails");
        playlistRequest.PlaylistId = playlistId;
        playlistRequest.MaxResults = 50;
        playlistRequest.PageToken = nextPageToken;

        var playlistResponse = await playlistRequest.ExecuteAsync();

        foreach (var item in playlistResponse.Items)
        {
            allVideos.Add(new PlaylistVideo
            {
                VideoId = item.ContentDetails.VideoId,
                Title = item.Snippet.Title,
                Description = item.Snippet.Description,
                Position = item.Snippet.Position ?? 0,
                PublishedAt = item.Snippet.PublishedAt
            });
        }

        nextPageToken = playlistResponse.NextPageToken;

    } while (nextPageToken != null);

    return allVideos;
}
```

### 4. Get User's Playlists (OAuth Required)

```csharp
using Google.Apis.Auth.OAuth2;
using System.Threading;

public async Task<List<PlaylistInfo>> GetMyPlaylistsAsync()
{
    // OAuth setup
    UserCredential credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
        new ClientSecrets
        {
            ClientId = "YOUR_CLIENT_ID",
            ClientSecret = "YOUR_CLIENT_SECRET"
        },
        new[] { YouTubeService.Scope.YoutubeReadonly },
        "user",
        CancellationToken.None
    );

    var service = new YouTubeService(new BaseClientService.Initializer()
    {
        HttpClientInitializer = credential,
        ApplicationName = "YouTubeMetadataApp"
    });

    var playlistRequest = service.Playlists.List("snippet,contentDetails");
    playlistRequest.Mine = true;
    playlistRequest.MaxResults = 50;

    var playlistResponse = await playlistRequest.ExecuteAsync();

    return playlistResponse.Items.Select(p => new PlaylistInfo
    {
        PlaylistId = p.Id,
        Title = p.Snippet.Title,
        Description = p.Snippet.Description,
        ItemCount = p.ContentDetails.ItemCount ?? 0
    }).ToList();
}
```

### 5. Detect if Video is a Short

```csharp
public async Task<bool> IsVideoShortAsync(string videoId, string channelId)
{
    // Method 1: Check duration
    var videoRequest = _youtubeService.Videos.List("contentDetails");
    videoRequest.Id = videoId;
    var videoResponse = await videoRequest.ExecuteAsync();

    if (videoResponse.Items.Count == 0)
        return false;

    var duration = ParseISO8601Duration(videoResponse.Items[0].ContentDetails.Duration);

    // Quick filter: if > 60 seconds, definitely not a Short
    if (duration > 60)
        return false;

    // Method 2: Check UUSH playlist (more reliable)
    string shortsPlaylistId = "UUSH" + channelId.Substring(2);

    var playlistRequest = _youtubeService.PlaylistItems.List("id");
    playlistRequest.PlaylistId = shortsPlaylistId;
    playlistRequest.VideoId = videoId;
    playlistRequest.MaxResults = 1;

    try
    {
        var playlistResponse = await playlistRequest.ExecuteAsync();
        return playlistResponse.Items.Count > 0;
    }
    catch
    {
        // If playlist doesn't exist or error, fall back to duration check
        return duration <= 60;
    }
}

private int ParseISO8601Duration(string duration)
{
    // Parse PT1M30S → 90 seconds
    var match = System.Text.RegularExpressions.Regex.Match(
        duration,
        @"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"
    );

    int hours = match.Groups[1].Success ? int.Parse(match.Groups[1].Value) : 0;
    int minutes = match.Groups[2].Success ? int.Parse(match.Groups[2].Value) : 0;
    int seconds = match.Groups[3].Success ? int.Parse(match.Groups[3].Value) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}
```

### 6. Get Channel's Uploads Playlist

```csharp
public async Task<string> GetChannelUploadsPlaylistIdAsync(string channelId)
{
    var channelRequest = _youtubeService.Channels.List("contentDetails");
    channelRequest.Id = channelId;

    var channelResponse = await channelRequest.ExecuteAsync();

    if (channelResponse.Items.Count == 0)
        return null;

    return channelResponse.Items[0].ContentDetails.RelatedPlaylists.Uploads;
}

// Usage: Get all uploaded videos from a channel
public async Task<List<PlaylistVideo>> GetChannelUploadsAsync(string channelId)
{
    string uploadsPlaylistId = await GetChannelUploadsPlaylistIdAsync(channelId);
    return await GetPlaylistVideosAsync(uploadsPlaylistId);
}
```

### 7. Batch Get Multiple Videos

```csharp
public async Task<List<VideoMetadata>> GetMultipleVideosAsync(List<string> videoIds)
{
    var allVideos = new List<VideoMetadata>();

    // Process in batches of 50
    for (int i = 0; i < videoIds.Count; i += 50)
    {
        var batch = videoIds.Skip(i).Take(50).ToList();

        var videoRequest = _youtubeService.Videos.List("snippet,contentDetails,statistics");
        videoRequest.Id = string.Join(",", batch);

        var videoResponse = await videoRequest.ExecuteAsync();

        foreach (var video in videoResponse.Items)
        {
            allVideos.Add(new VideoMetadata
            {
                VideoId = video.Id,
                Title = video.Snippet.Title,
                Description = video.Snippet.Description,
                ViewCount = video.Statistics.ViewCount,
                Duration = video.ContentDetails.Duration
            });
        }
    }

    return allVideos;
}
```

### 8. WebAPI Controller Example

```csharp
using System.Web.Http;

public class YouTubeController : ApiController
{
    private readonly YouTubeApiService _youtubeService;

    public YouTubeController()
    {
        _youtubeService = new YouTubeApiService();
    }

    [HttpGet]
    [Route("api/youtube/video/{videoId}")]
    public async Task<IHttpActionResult> GetVideo(string videoId)
    {
        try
        {
            var video = await _youtubeService.GetVideoMetadataAsync(videoId);

            if (video == null)
                return NotFound();

            return Ok(video);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet]
    [Route("api/youtube/playlist/{playlistId}/videos")]
    public async Task<IHttpActionResult> GetPlaylistVideos(string playlistId)
    {
        try
        {
            var videos = await _youtubeService.GetPlaylistVideosAsync(playlistId);
            return Ok(videos);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet]
    [Route("api/youtube/channel/{channelId}/uploads")]
    public async Task<IHttpActionResult> GetChannelUploads(string channelId)
    {
        try
        {
            var videos = await _youtubeService.GetChannelUploadsAsync(channelId);
            return Ok(videos);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet]
    [Route("api/youtube/video/{videoId}/isshort")]
    public async Task<IHttpActionResult> IsVideoShort(string videoId, string channelId)
    {
        try
        {
            var isShort = await _youtubeService.IsVideoShortAsync(videoId, channelId);
            return Ok(new { videoId, isShort });
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
}
```

### Model Classes

```csharp
public class VideoMetadata
{
    public string VideoId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string ChannelId { get; set; }
    public string ChannelTitle { get; set; }
    public string ThumbnailUrl { get; set; }
    public string Duration { get; set; }
    public ulong? ViewCount { get; set; }
    public ulong? LikeCount { get; set; }
    public ulong? CommentCount { get; set; }
    public List<string> Tags { get; set; }
}

public class PlaylistVideo
{
    public string VideoId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int Position { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class PlaylistInfo
{
    public string PlaylistId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public long ItemCount { get; set; }
}
```

---

## Quick Reference

### Common Parameters

| Parameter | Description | Values |
|-----------|-------------|--------|
| `part` | Resource properties to include | Comma-separated: `snippet`, `contentDetails`, `statistics`, etc. |
| `id` | Resource ID(s) | Comma-separated IDs (max 50 for videos) |
| `maxResults` | Items per page | 1-50 (default: 5) |
| `pageToken` | Page navigation | Token from previous response |
| `key` | API key | Your API key |
| `mine` | User's resources | `true` (requires OAuth) |

### Duration Format (ISO 8601)

| Format | Example | Duration |
|--------|---------|----------|
| `PT#S` | `PT45S` | 45 seconds |
| `PT#M#S` | `PT4M13S` | 4 minutes 13 seconds |
| `PT#H#M#S` | `PT1H30M` | 1 hour 30 minutes |

### Response Fields Mapping

```
snippet.title           → Video/Playlist Title
snippet.description     → Video/Playlist Description
snippet.publishedAt     → Publication Date (ISO 8601)
snippet.thumbnails      → Thumbnail URLs (default, medium, high, standard, maxres)
snippet.channelId       → Channel ID
snippet.channelTitle    → Channel Name
contentDetails.duration → Video Duration (ISO 8601)
statistics.viewCount    → View Count
statistics.likeCount    → Like Count
statistics.commentCount → Comment Count
```

### Error Handling

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 400 | Bad Request | Check parameter format |
| 401 | Unauthorized | Check API key or OAuth token |
| 403 | Forbidden | Check quota or permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded - implement backoff |

### Best Practices Checklist

- ✅ Use API keys for public data, OAuth for private data
- ✅ Request only needed `part` parameters
- ✅ Batch video requests (up to 50 IDs)
- ✅ Avoid `search.list` - use specific endpoints when possible
- ✅ Implement caching to reduce API calls
- ✅ Handle pagination properly with `pageToken`
- ✅ Monitor quota usage in Google Cloud Console
- ✅ Implement retry logic with exponential backoff
- ✅ Use ETags for conditional requests
- ✅ Parse ISO 8601 durations correctly

---

## Additional Resources

- [Official API Reference](https://developers.google.com/youtube/v3/docs)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Guide](https://developers.google.com/youtube/v3/guides/authentication)
- [Code Samples](https://developers.google.com/youtube/v3/code_samples)

---

**Last Updated:** October 2025
**API Version:** YouTube Data API V3
**Target Framework:** .NET Framework 4.8 / C# WebAPI 2.0
