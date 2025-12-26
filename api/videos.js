export default async function handler(req, res) {
  // Playlist ID for "Top 100 Songs Argentina" (YouTube Music)
  const PLAYLIST_ID = "PL4fGSI1pDJn4Kd7YEG9LbUqvt64PLs9Fo";
  const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
  
  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml');
    
    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching video feed:", error);
    res.status(500).json({ error: "Failed to fetch video feed" });
  }
}
