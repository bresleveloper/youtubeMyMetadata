# youtubeMyMetadata

pute HTML5 / ES16 / CSS3 solution to get your metadata from youtube fast as JSON. used by me for my AI.

made as pure client side solution for you ♥.



### Next Steps - IMPORTANT!

  You need to get an OAuth 2.0 Client ID from Google Cloud Console:

  1. Go to https://console.cloud.google.com/
  2. Create a new project or select existing one
  3. Enable YouTube Data API v3
  4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
  5. Configure OAuth consent screen
  6. Add your domain as authorized JavaScript origin
  7. Copy the Client ID and replace YOUR_CLIENT_ID_HERE.apps.googleusercontent.com in youtubeMeta.js:11

  The app will now authenticate users with OAuth 2.0 and successfully access their YouTube data!