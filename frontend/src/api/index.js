export const setEffect = (index, effect, speed) => API.post('/effect/set', { index, effect, speed });
export const getEffects = () => API.get('/effect/get');
export const addText = (data) => API.post('/text/add', data);
