import React, { useState } from 'react';
import { renderVideo } from '../api';

const ExportButton = ({ videos, addLog }) => {
  const [rendering, setRendering] = useState(false);

  const handleRender = async () => {
    if (videos.length === 0) {
      alert('Lütfen en az 1 video yükleyin!');
      return;
    }
    setRendering(true);
    addLog('⏳ Render başladı. Bu 1-5 dakika sürebilir.');
    try {
      const res = await renderVideo();
      const url = `http://localhost:5000${res.data.download_url}`;
      addLog(`✅ Render tamamlandı! İndir: ${url}`);
      // Otomatik indirme başlat
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      addLog(`❌ Render hatası: ${err.response?.data?.error || err.message}`);
    }
    setRendering(false);
  };

  return (
    <div className="export-area">
      <button 
        onClick={handleRender} 
        disabled={rendering || videos.length === 0} 
        className="render-btn"
      >
        {rendering ? '⏳ İşleniyor... Lütfen Bekleyin' : '🚀 Videoyu Render Et & İndir'}
      </button>
      <p className="info">Toplam video: {videos.length}</p>
    </div>
  );
};

export default ExportButton;
