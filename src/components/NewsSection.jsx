import React, { useState, useEffect } from 'react';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Usamos Google News RSS filtrado por Formosa Argentina
  const FEED_URL = "https://news.google.com/rss/search?q=Formosa+Argentina&hl=es-419&gl=AR&ceid=AR:es-419";
  
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos nuestro propio endpoint API en Vercel como proxy
      const proxyUrl = '/api/news';
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error("No se pudo obtener el contenido del feed");
      }

      const xmlText = await response.text();

      // Usar DOMParser nativo del navegador
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = xmlDoc.querySelectorAll("item");
      
      const processedNews = Array.from(items).map(item => {
        const title = item.querySelector("title")?.textContent || "Sin título";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDate = item.querySelector("pubDate")?.textContent;
        
        // Handle Description (removing CDATA/HTML if needed for preview)
        let description = item.querySelector("description")?.textContent || "";
        // Simple HTML strip for clean text preview if it contains tags
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = description;
        const cleanDescription = tempDiv.textContent || tempDiv.innerText || "";

        const source = item.querySelector("source")?.textContent || "El Comercial";
        
        // Intentar extraer imagen
        let image = null;
        
        // 1. Buscar en content:encoded (Namespace Content) - Common in Wordpress/El Comercial
        const contentEncoded = item.getElementsByTagNameNS("http://purl.org/rss/1.0/modules/content/", "encoded")[0];
        if (contentEncoded) {
            const contentText = contentEncoded.textContent;
            const imgMatch = contentText.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                image = imgMatch[1];
            }
        }
        
        // 2. Buscar en media:content (Namespace Media RSS)
        if (!image) {
            const mediaContent = item.getElementsByTagNameNS("http://search.yahoo.com/mrss/", "content")[0];
            if (mediaContent) {
            image = mediaContent.getAttribute("url");
            }
        }
        
        // 3. Buscar en description (HTML incrustado)
        if (!image && description) {
          const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            image = imgMatch[1];
          }
        }
        
        // 4. Buscar en enclosure
        if (!image) {
          const enclosure = item.querySelector("enclosure");
          if (enclosure && enclosure.getAttribute("type")?.startsWith("image/")) {
            image = enclosure.getAttribute("url");
          }
        }
        
        // Fallback image if none found
        if (!image) {
            // Optional: Use a placeholder or keep null
        }

        return {
          title,
          link,
          pubDate,
          source,
          content: cleanDescription,
          image
        };
      });

      setNews(processedNews);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("No se pudieron cargar las noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Actualizar cada 15 minutos (900000 ms)
    const intervalId = setInterval(fetchNews, 900000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && news.length === 0) {
    return <div className="news-loading">CARGANDO NOTICIAS...</div>;
  }

  if (error && news.length === 0) {
    return <div className="news-error">{error}</div>;
  }

  return (
    <div className="news-container">
      {news.map((item, index) => (
        <div key={index} className="news-item" onClick={() => setSelectedArticle(item)}>
          {item.image && (
            <div className="news-image">
              <img src={item.image} alt="Noticia" />
            </div>
          )}
          <div className="news-content">
            <h3 className="news-title">{item.title}</h3>
            <div className="news-meta">
              <span className="news-source">{item.source}</span>
              {item.pubDate && (
                <span className="news-date">
                  {new Date(item.pubDate).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              {selectedArticle.image && (
                <img src={selectedArticle.image} alt={selectedArticle.title} className="modal-image" />
              )}
              <div className="modal-text-content">
                <div className="modal-header" style={{padding: '0 0 1rem 0', border: 'none'}}>
                  <h3 className="modal-title">{selectedArticle.title}</h3>
                  <button className="modal-close-btn" onClick={() => setSelectedArticle(null)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" height="24" width="24">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="modal-meta">
                  <span>{selectedArticle.source}</span>
                  {selectedArticle.pubDate && (
                    <span>{new Date(selectedArticle.pubDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>

                <div 
                  className="modal-description"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <a 
                href={selectedArticle.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="read-full-btn"
              >
                Leer nota completa
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
