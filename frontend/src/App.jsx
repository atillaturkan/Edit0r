import React, { useState, useEffect } from 'react';
import VideoTimeline from './components/VideoTimeline';
import LogoPanel from './components/LogoPanel';
import AudioPanel from './components/AudioPanel';
import ExportButton from './components/ExportButton';
import EffectPanel from './components/EffectPanel';
import TextPanel from './components/TextPanel';
import { getVideos, resetSession } from './api';
import './index.css';

function App() {
  const [videos, setVideos] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev]);

  const fetchVideos = async () => {
    try {
      const res = await getVideos();
      setVideos(res.data.videos || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleReset = async () => {
    await resetSession();
    setVideos([]);
    addLog('🔄 Oturum sıfırlandı');
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎬 Edit0r - Pro Video Düzenleyici</h1>
        <button onClick={handleReset} className="reset-btn">🔄 Oturumu Sıfırla</button>
      </header>

      <div className="grid-4">
        <div className="card">
          <h2>🎞️ Zaman Çizelgesi</h2>
          <VideoTimeline videos={videos} setVideos={setVideos} addLog={addLog} />
        </div>
        
        <div className="card">
          <h2>⚡ Efektler</h2>
          <EffectPanel videos={videos} setVideos={setVideos} addLog={addLog} />
        </div>
        
        <div className="card">
          <h2>🖼️ Logo & Ses</h2>
          <LogoPanel addLog={addLog} />
          <div style={{ height: '15px' }}></div>
          <AudioPanel addLog={addLog} />
        </div>
        
        <div className="card">
          <h2>⚙️ Dışa Aktar</h2>
          <ExportButton videos={videos} addLog={addLog} />
          <div className="log-area">
            <h4>📋 İşlem Günlüğü</h4>
            <div className="log-box">
              {logs.map((log, i) => <div key={i} className="log-line">{log}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
