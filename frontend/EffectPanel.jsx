import React, { useState, useEffect } from 'react';
import { setEffect, getEffects } from '../api';

const EffectPanel = ({ videoCount, addLog }) => {
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    fetchEffects();
  }, [videoCount]);

  const fetchEffects = async () => {
    try {
      const res = await getEffects();
      setEffects(res.data.effects || []);
    } catch (e) {}
  };

  const handleChange = (idx, field, value) => {
    const newEff = [...effects];
    if (!newEff[idx]) newEff[idx] = { effect: 'none', speed: 1.0 };
    newEff[idx][field] = value;
    setEffects(newEff);
    setEffect(idx, newEff[idx].effect, newEff[idx].speed);
    addLog(`Efekt güncellendi: Video ${idx+1} -> ${newEff[idx].effect}`);
  };

  return (
    <div className="effect-panel">
      <h3>🎨 Efekt Ayarları (Her Video İçin)</h3>
      {[...Array(videoCount)].map((_, i) => (
        <div key={i} className="effect-row">
          <span>Video {i+1}</span>
          <select onChange={(e) => handleChange(i, 'effect', e.target.value)} value={effects[i]?.effect || 'none'}>
            <option value="none">Yok</option>
            <option value="black_white">Siyah-Beyaz</option>
            <option value="sepia">Sepya</option>
            <option value="invert">Ters Renk</option>
            <option value="brightness">Parlaklık</option>
          </select>
          <input type="number" step="0.1" min="0.1" max="3.0" 
                 placeholder="Hız" value={effects[i]?.speed || 1.0}
                 onChange={(e) => handleChange(i, 'speed', parseFloat(e.target.value))} />
        </div>
      ))}
    </div>
  );
};
export default EffectPanel;
