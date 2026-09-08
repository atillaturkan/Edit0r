import React, { useState } from 'react';
import { updateVideo, getVideos } from '../api';

const EffectPanel = ({ videos, setVideos, addLog }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleEffectChange = async (field, value) => {
    if (videos.length === 0) return;
    const idx = selectedIndex;
    const updated = { ...videos[idx], [field]: value };
    await updateVideo({ index: idx, ...updated });
    const res = await getVideos();
    setVideos(res.data.videos);
    addLog(`⚙️ Efekt güncellendi: ${field}=${value}`);
  };

  if (videos.length === 0) {
    return <p className="hint">Lütfen önce video yükleyin.</p>;
  }

  const v = videos[selectedIndex] || {};

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        Video seç: 
        <select 
          value={selectedIndex} 
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          style={{ marginLeft: '8px', padding: '4px 8px', background: '#0a0a15', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
        >
          {videos.map((vid, i) => (
            <option key={i} value={i}>{i+1}. {vid.name}</option>
          ))}
        </select>
      </label>

      <div className="effect-group">
        <label>Hız (0.5 - 3.0): 
          <input type="number" step="0.1" min="0.1" max="3" value={v.speed || 1} onChange={(e) => handleEffectChange('speed', parseFloat(e.target.value))} />
        </label>
        <label>Ses (0 - 2): 
          <input type="number" step="0.1" min="0" max="2" value={v.volume || 1} onChange={(e) => handleEffectChange('volume', parseFloat(e.target.value))} />
        </label>
        <label>FadeIn (sn): 
          <input type="number" step="0.5" min="0" max="5" value={v.fade_in || 0} onChange={(e) => handleEffectChange('fade_in', parseFloat(e.target.value))} />
        </label>
        <label>FadeOut (sn): 
          <input type="number" step="0.5" min="0" max="5" value={v.fade_out || 0} onChange={(e) => handleEffectChange('fade_out', parseFloat(e.target.value))} />
        </label>
        <label>Döndür: 
          <select value={v.rotate || 0} onChange={(e) => handleEffectChange('rotate', parseInt(e.target.value))}>
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </label>
        <label>Parlaklık (-1 - 1): 
          <input type="number" step="0.1" min="-1" max="1" value={v.brightness || 0} onChange={(e) => handleEffectChange('brightness', parseFloat(e.target.value))} />
        </label>
      </div>
    </div>
  );
};

export default EffectPanel;
