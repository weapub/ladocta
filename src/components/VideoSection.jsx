import React, { useState, useEffect } from 'react';
import './VideoSection.css';

const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const proxyUrl = '/api/videos';
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de videos");
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const entries = xmlDoc.querySelectorAll("entry");
      
      const videoItems = Array.from(entries).map(entry => {
        const title = entry.querySelector("title")?.textContent || "Sin título";
        const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent;
        const mediaGroup = entry.getElementsByTagName("media:group")[0];
        const thumbnail = mediaGroup?.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url");
        
        return {
          id: videoId,
          title: title,
          thumbnail: thumbnail
        };
      }).filter(item => item.id); // Filter out items without ID

      setVideos(videoItems);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Error al cargar los videos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="video-section">
      <h2>Tendencias Argentina</h2>
      
      {loading && (
        <div className="loading-container">
          <p>Cargando tendencias...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchVideos} style={{marginTop: '10px', padding: '5px 10px'}}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="video-grid">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="video-card"
              onClick={() => openVideo(video)}
            >
              <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
              <div className="video-info">
                <p className="video-title">{video.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div className="video-modal-overlay" onClick={closeVideo}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVideo}>&times;</button>
            <div className="video-frame-container">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`} 
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
