import React, { useState } from 'react';
import { uploadVideo, moveVideo, deleteVideo, getVideos, updateVideo } from '../api';

const VideoTimeline = ({ videos, setVideos, addLog }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setLoading(true);
    for (let file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        // Varsayılan efektler
        formData.append('speed', '1.0');
        formData.append('volume', '1.0');
        formData.append('fade_in', '0');
        formData.append('fade_out', '0');
        formData.append('rotate', '0');
        formData.append('flip', 'none');
        formData.append('brightness', '0');
        
        await uploadVideo(file);
        addLog(`📂 Yüklendi: ${file.name}`);
      } catch (err) {
        addLog(`❌ Yükleme hatası: ${file.name}`);
      }
    }
    const res = await getVideos();
    setVideos(res.data.videos);
    setLoading(false);
    e.target.value = null;
  };

  const handleMove = async (idx, direction) => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= videos.length) return;
    await moveVideo(idx, newIdx);
    const res = await getVideos();
    setVideos(res.data.videos);
    addLog(`↕️ Sıralama değiştirildi`);
  };

  const handleDelete = async (idx) => {
    await deleteVideo(idx);
    const res = await getVideos();
    setVideos(res.data.videos);
    addLog(`🗑 Video silindi`);
  };

  return (
    <div>
      <input type="file" multiple accept="video/*" onChange={handleUpload} disabled={loading} />
      {loading && <span> Yükleniyor...</span>}
      <ul className="video-list">
        {videos.map((v, idx) => (
          <li key={idx} className="video-item">
            <span>{idx+1}. {v.name}</span>
            <div>
              <button onClick={() => handleMove(idx, 'up')} disabled={idx===0}>⬆</button>
              <button onClick={() => handleMove(idx, 'down')} disabled={idx===videos.length-1}>⬇</button>
              <button onClick={() => handleDelete(idx)} className="del-btn">✕</button>
            </div>
          </li>
        ))}
      </ul>
      {videos.length === 0 && <p className="hint">Yukarıdan video yükleyerek başlayın.</p>}
    </div>
  );
};

export default VideoTimeline;
