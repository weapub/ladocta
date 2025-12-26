import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.css';
import logoPlaceholder from '../assets/ladocta-logo.jpg';
import NewsSection from './NewsSection';
import VideoSection from './VideoSection';
import ContactSection from './ContactSection';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('radio');
  
  // Estado para la URL del stream
  // Usamos una URL de ejemplo funcional (Radio Nacional Argentina) para demostrar que el reproductor funciona.
  // El usuario final deberá cambiar esto por la URL real de La Docta FM.
  const [streamUrl] = useState("https://stream.listafm.com.ar:8028/;"); 
  const [volume, setVolume] = useState(100);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [trackInfo, setTrackInfo] = useState({
    artist: 'EL COLORADO FORMOSA',
    title: 'LA DOCTA FM 99.3'
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Intentamos obtener metadatos. Usamos un proxy CORS si es necesario.
        // URL directa de metadatos
        const metadataUrl = 'https://stream.listafm.com.ar:8028/stats?sid=1&json=1';
        
        // Intentamos primero con corsproxy.io que suele ser más rápido y estable
        try {
          const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(metadataUrl)}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          updateTrackInfo(data);
          return; // Éxito, salimos
        } catch (e) {
          console.warn('Fallo corsproxy.io, intentando allorigins...', e);
        }

        // Fallback a allorigins.win
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(metadataUrl)}`;
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);
        updateTrackInfo(data);

      } catch (error) {
        console.log('Error al obtener metadatos (todos los intentos fallaron):', error);
      }
    };

    const updateTrackInfo = (data) => {
      if (data && data.songtitle) {
        const parts = data.songtitle.split(' - ');
        if (parts.length >= 2) {
          setTrackInfo({
            artist: parts[0],
            title: parts.slice(1).join(' - ')
          });
        } else {
          setTrackInfo({
            artist: 'EL COLORADO FORMOSA',
            title: data.songtitle
          });
        }
      }
    };

    // Fetch inicial
    fetchMetadata();

    // Actualizar cada 15 segundos
    const interval = setInterval(fetchMetadata, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.volume = volume / 100;
          // Intentar reproducir solo si hay interacción previa o si el navegador lo permite
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(err => {
                console.log("Autoplay bloqueado o stream no válido:", err);
                setIsPlaying(false);
              });
          }
        }
      } catch (err) {
        console.log("Error general de reproducción:", err);
        setIsPlaying(false);
      }
    };

    // Pequeño timeout para asegurar que el DOM está listo
    setTimeout(playAudio, 1000);
  }, [streamUrl]);

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(e => {
              console.error("Error al reproducir:", e);
              setIsPlaying(false);
              alert("No se pudo reproducir el stream. Verifica la URL.");
            });
        }
      }
    }
  };

  const handleCast = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Estrategia 1: API RemotePlayback (Chrome, Edge, Android)
    if (audio.remotePlayback) {
      audio.remotePlayback.prompt()
        .then(() => console.log('Seleccionando dispositivo de transmisión...'))
        .catch(error => {
          console.error('Error en RemotePlayback:', error);
          if (error.name === 'NotFoundError') {
             alert("No se encontraron dispositivos de transmisión disponibles cercanos.");
          } else if (error.name !== 'NotAllowedError') {
             // NotAllowedError ocurre si el usuario cancela, no es necesario alertar
             alert("Ocurrió un error al intentar transmitir. Intenta desde el menú del navegador.");
          }
        });
    } 
    // Estrategia 2: API WebKit AirPlay (Safari iOS/Mac)
    else if (audio.webkitShowPlaybackTargetPicker) {
      audio.webkitShowPlaybackTargetPicker();
    }
    // Fallback
    else {
      alert("Tu dispositivo no soporta transmisión directa desde este botón.\n\nPor favor, usa la opción 'Transmitir', 'Cast' o 'AirPlay' en el menú de tu navegador o sistema.");
    }
  };

  return (
    <div className="audio-player">
      {/* Elemento de audio oculto */}
      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="auto" 
        crossOrigin="anonymous"
        x-webkit-airplay="allow"
        onError={(e) => {
          console.error("Error en el tag de audio:", e);
          setIsPlaying(false);
        }}
      />

      <div className="player-header">
        <div className="menu-icon" onClick={() => setIsMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
        <div className="header-logo">
           <div className="music-note-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#ff0000"/>
              </svg>
           </div>
        </div>
        <div className="cast-icon" onClick={handleCast}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
             <line x1="2" y1="20" x2="2.01" y2="20"></line>
           </svg>
        </div>
      </div>
      
      {activeTab === 'radio' && (
        <div className="radio-content">
          <div className="station-header-info">
            <div className="station-location">EL COLORADO FORMOSA</div>
            <div className="station-title">LA DOCTA FM 99.3</div>
          </div>
          
          <div className="album-art-container">
            <img 
              src={logoPlaceholder} 
              alt="Album Art" 
              className="album-cover"
              onError={(e) => {e.target.src = logoPlaceholder}}
            />
          </div>

          <div className="track-info">
            <div className="track-title">{trackInfo.title}</div>
            <div className="track-subtitle">{trackInfo.artist}</div>
          </div>

          <div className="controls-container">
            <div className="volume-slider-container">
              <div className="live-indicator-text">Live</div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{background: `linear-gradient(to right, #ff0000 ${volume}%, #4a4a4a ${volume}%)`}}
              />
            </div>

            <div className="playback-controls">
              <div className="control-spacer"></div> {/* Placeholder for left icon */}
              
              <button 
                className="play-btn" 
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="black" height="32" width="32">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="black" height="32" width="32">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              <button className="more-btn" onClick={() => setIsMoreMenuOpen(true)}>
                 <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && <NewsSection />}
      {activeTab === 'video' && <VideoSection />}
      {activeTab === 'contact' && <ContactSection />}
      
      {/* Footer Navigation Simulation */}
      <div className="footer-nav">
        <div 
          className={`nav-item ${activeTab === 'radio' ? 'active' : ''}`}
          onClick={() => setActiveTab('radio')}
        >
          <svg viewBox="0 0 24 24" fill={activeTab === 'radio' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'radio' ? "0" : "2"} height="20" width="20">
             {activeTab === 'radio' ? (
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
             ) : (
               <circle cx="12" cy="12" r="10"></circle>
             )}
             {activeTab !== 'radio' && <circle cx="12" cy="12" r="3"></circle>} 
          </svg>
          <span>Radio</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <svg viewBox="0 0 24 24" fill={activeTab === 'news' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'news' ? "0" : "2"} height="20" width="20">
             <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Noticias</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          <svg viewBox="0 0 24 24" fill={activeTab === 'video' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'video' ? "0" : "2"} height="20" width="20"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
          <span>Videos</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <svg viewBox="0 0 24 24" fill={activeTab === 'contact' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'contact' ? "0" : "2"} height="20" width="20">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Contacto</span>
        </div>
      </div>

      {/* Menu Modal */}
      {isMenuOpen && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>&times;</button>
            <h2>Información</h2>
            <div className="menu-info-item">
              <h3>La Docta FM 99.3</h3>
              <p>El Colorado, Formosa</p>
            </div>
            <div className="menu-info-item">
              <h3>Versión App</h3>
              <p>v1.0.2 (Beta)</p>
            </div>
            <div className="menu-info-item">
              <h3>Contacto Comercial</h3>
              <p>+54 9 3704 36-9955</p>
            </div>
            
            <button className="share-btn" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'La Docta FM 99.3',
                  text: 'Escucha La Docta FM 99.3 en vivo desde El Colorado, Formosa.',
                  url: window.location.href,
                })
                .catch((error) => console.log('Error compartiendo', error));
              } else {
                alert('Copiar enlace: ' + window.location.href);
              }
            }}>
              Compartir App
            </button>
          </div>
        </div>
      )}

      {/* More Options Modal */}
      {isMoreMenuOpen && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <button className="close-menu-btn" onClick={() => setIsMoreMenuOpen(false)}>&times;</button>
            <h2>Opciones</h2>
            
            <div className="menu-info-item" style={{cursor: 'pointer'}} onClick={() => window.location.href = 'mailto:info@ladoctafm.com.ar?subject=Reporte%20App'}>
              <h3>Reportar Problema</h3>
              <p>Contáctanos por email</p>
            </div>

            <div className="menu-info-item">
              <h3>Calidad de Stream</h3>
              <p>Alta (128 kbps)</p>
            </div>

            <div className="menu-info-item">
              <h3>Temporizador</h3>
              <p style={{fontSize: '0.8rem', opacity: 0.7}}>Próximamente</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioPlayer;
