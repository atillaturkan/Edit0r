import React, { useState } from 'react';
import { addAudio } from '../api';

const AudioPanel = ({ addLog }) => {
  const [file, setFile] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [volume, setVolume] = useState(0.8);

  const handleSubmit = async () => {
    if (!file) {
      alert('Lütfen bir ses dosyası seçin!');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start', start);
    formData.append('end', end);
    formData.append('volume', volume);
    try {
      await addAudio(formData);
      addLog(`🎵 Ses eklendi: ${file.name} (${start}-${end}sn, vol:${volume})`);
      setFile(null);
      document.getElementById('audioInput').value = '';
    } catch (err) {
      addLog(`❌ Ses hatası: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="panel-row">
        <input id="audioInput" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      <div className="panel-row">
        <label>Başlangıç (sn): <input type="number" value={start} onChange={(e) => setStart(parseFloat(e.target.value))} /></label>
        <label>Bitiş (sn): <input type="number" value={end} onChange={(e) => setEnd(parseFloat(e.target.value))} /></label>
        <label>Ses (0-2): <input type="number" step="0.1" min="0" max="2" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} /></label>
        <button className="panel-btn" onClick={handleSubmit}>➕ Ekle</button>
      </div>
    </div>
  );
};

export default AudioPanel;
