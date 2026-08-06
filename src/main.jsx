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
import ChatLazy from './pages/Chat/ChatLazy';
import PolicyBot from './pages/PolicyBot/PolicyBot';
import './styles/global.css';

// GitHub Pages has no SPA rewrite; deep links land on 404.html, which is a copy
// of index.html (see package.json build), so the router below takes over there.
//
// The site used HashRouter until BitResearch launched; old links look like
// btcedu.org/#/research. Rewrite them onto the clean path before rendering.
if (window.location.hash.startsWith('#/')) {
  const target = window.location.hash.slice(1).replace(/^\/research/, '/BitResearch');
  window.history.replaceState(null, '', target);
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
          {/* Reachable by direct URL only: nothing on the site links here, and
              it is noindex + robots-disallowed. See ChatLazy for why. */}
          <Route path="BitResearch" element={<ChatLazy />} />
          <Route path="research" element={<Navigate to="/BitResearch" replace />} />
          {/* Same posture: unlinked, noindex, robots-disallowed. This one only
              forwards to the SwIRL handbook bot, which is hosted separately —
              it can edit the handbooks, so it is never served from this site. */}
          <Route path="handbot" element={<PolicyBot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
