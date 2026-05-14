// `StrictMode` envuelve la app y en dev hace 2 cosas útiles:
//  1. Doble-renderea componentes para detectar side effects impuros.
//  2. Avisa sobre APIs deprecadas.
// En producción no hace nada → cero costo.
import { StrictMode } from 'react';

// `createRoot` es la API de mount de React 18+. Reemplaza al viejo
// `ReactDOM.render`. Habilita features como concurrent rendering.
import { createRoot } from 'react-dom/client';

// `BrowserRouter` provee el contexto de routing usando la History API
// del browser. Tiene que envolver toda la app para que Routes/Route/Link
// funcionen adentro.
import { BrowserRouter } from 'react-router-dom';

// CSS global con Tailwind + variables del design system.
// Vite resuelve el import y lo bundlea como hoja de estilos.
import './index.css';

import App from './App.jsx';

// Buscamos el <div id="root"> de index.html y montamos React adentro.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
