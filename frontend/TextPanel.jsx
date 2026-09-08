import React, { useState } from 'react';
import { addText } from '../api';

const TextPanel = ({ addLog }) => {
  const [text, setText] = useState('');
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [fontsize, setFontsize] = useState(40);
  const [color, setColor] = useState('white');
  const [animation, setAnimation] = useState('none');

  const handleAdd = async () => {
    if (!text) return alert('Metin girin');
    try {
      await addText({ text, start, end, fontsize, color, animation });
      addLog(`Metin eklendi: "${text}" (${start}-${end}sn)`);
      setText('');
    } catch (e) { alert('Hata'); }
  };

  return (
    <div className="text-panel">
      <h3>✍️ Metin Animasyonu</h3>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Metin" />
      <input type="number" value={start} onChange={(e) => setStart(parseFloat(e.target.value))} placeholder="Başlangıç" />
      <input type="number" value={end} onChange={(e) => setEnd(parseFloat(e.target.value))} placeholder="Bitiş" />
      <input type="number" value={fontsize} onChange={(e) => setFontsize(parseInt(e.target.value))} placeholder="Boyut" />
      <select value={color} onChange={(e) => setColor(e.target.value)}>
        <option value="white">Beyaz</option>
        <option value="red">Kırmızı</option>
        <option value="blue">Mavi</option>
        <option value="green">Yeşil</option>
        <option value="yellow">Sarı</option>
      </select>
      <select value={animation} onChange={(e) => setAnimation(e.target.value)}>
        <option value="none">Sabit</option>
        <option value="slide">Kayma (Slide)</option>
      </select>
      <button onClick={handleAdd}>➕ Metin Ekle</button>
    </div>
  );
};
export default TextPanel;
