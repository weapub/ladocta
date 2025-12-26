export default async function handler(req, res) {
  // Primary Feed: "El Comercial" (includes images)
  const PRIMARY_FEED = "https://www.elcomercial.com.ar/rss/";
  // Fallback Feed: Google News (reliable, but fewer images)
  const FALLBACK_FEED = "https://news.google.com/rss/search?q=Formosa+Argentina&hl=es-419&gl=AR&ceid=AR:es-419";
  
  const fetchFeed = async (url) => {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  };

  try {
    let data;
    try {
      console.log(`Fetching primary feed: ${PRIMARY_FEED}`);
      data = await fetchFeed(PRIMARY_FEED);
    } catch (primaryError) {
      console.error("Primary feed failed, trying fallback:", primaryError);
      data = await fetchFeed(FALLBACK_FEED);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml');
    
    res.status(200).send(data);
  } catch (error) {
    console.error("All news feeds failed:", error);
    res.status(500).json({ error: "Failed to fetch news feed" });
  }
}
