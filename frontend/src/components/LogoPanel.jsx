import React, { useState } from 'react';
import { addLogo } from '../api';

const LogoPanel = ({ addLog }) => {
  const [file, setFile] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);

  const handleSubmit = async () => {
    if (!file) {
      alert('Lütfen bir logo dosyası seçin!');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start', start);
    formData.append('end', end);
    try {
      await addLogo(formData);
      addLog(`🖼️ Logo eklendi: ${file.name} (${start}-${end}sn)`);
      setFile(null);
      document.getElementById('logoInput').value = '';
    } catch (err) {
      addLog(`❌ Logo hatası: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="panel-row">
        <input id="logoInput" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      <div className="panel-row">
        <label>Başlangıç (sn): <input type="number" value={start} onChange={(e) => setStart(parseFloat(e.target.value))} /></label>
        <label>Bitiş (sn): <input type="number" value={end} onChange={(e) => setEnd(parseFloat(e.target.value))} /></label>
        <button className="panel-btn" onClick={handleSubmit}>➕ Ekle</button>
      </div>
    </div>
  );
};

export default LogoPanel;
