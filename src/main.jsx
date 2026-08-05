import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Home from './pages/Home/Home';
import WhatWeDo from './pages/WhatWeDo/WhatWeDo';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Conference from './pages/Conference/Conference';
import Donate from './pages/Donate/Donate';
import PreviewGate from './pages/Chat/PreviewGate';
import './styles/global.css';

// GitHub Pages has no SPA rewrite; deep links land on 404.html, which is a copy
// of index.html (see package.json build), so the router below takes over there.
//
// The site used HashRouter until BitResearch launched; old links look like
// btcedu.org/#/about. Rewrite them onto the clean path before rendering.
//
// Old #/research links are deliberately NOT mapped onto /BitResearch any more:
// BitResearch is an unlisted preview now, so they fall through to the home page.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="what-we-do" element={<WhatWeDo />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="conference" element={<Conference />} />
          <Route path="donate" element={<Donate />} />
          {/* Unlisted: renders only with the preview token (see config/preview.js). */}
          <Route path="BitResearch" element={<PreviewGate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
