import { useState } from 'react'
import AudioPlayer from './components/AudioPlayer'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <AudioPlayer />
        
        <div className="info-section">
          <p>Tu compañía de todos los días.</p>
          <p>La mejor música y noticias de la región.</p>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} La Docta FM 99.3 - Todos los derechos reservados</p>
      </footer>
    </div>
  )
}

export default App
