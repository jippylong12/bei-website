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
import Newsletter from './pages/Newsletter/Newsletter';
import PolicyBot from './pages/PolicyBot/PolicyBot';
import Maps from './pages/Maps/Maps';
import Faculty from './pages/Faculty/Faculty';
import Portal from './pages/Faculty/Portal';
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
          {/* One Conference page: 2027 unless ?year=2026. The per-year
              addresses it replaced still work. */}
          <Route path="conference" element={<Conference />} />
          <Route path="conference-2026" element={<Navigate to="/conference?year=2026" replace />} />
          <Route path="conference-2027" element={<Navigate to="/conference" replace />} />
          <Route path="donate" element={<Donate />} />
          <Route path="maps" element={<Maps />} />
          {/* The faculty pages. /faculty is the public directory;
              /faculty/portal is the Portal, behind a sign-in (noindex +
              robots-disallowed): course materials, and the speakers at
              ?tab=speakers (a query, so changing tab is not a new page). The
              people, their pictures and the materials all come from the
              backend: none of it is in this repository. */}
          <Route path="faculty" element={<Faculty />} />
          <Route path="faculty/portal" element={<Portal />} />
          {/* Reachable by direct URL only: nothing on the site links here, and
              it is noindex + robots-disallowed. See ChatLazy for why. */}
          <Route path="BitResearch" element={<ChatLazy />} />
          <Route path="BitResearch/newsletter" element={<Newsletter />} />
          <Route path="newsletter" element={<Navigate to="/BitResearch/newsletter" replace />} />
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
