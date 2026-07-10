import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home/Home';
import WhatWeDo from './pages/WhatWeDo/WhatWeDo';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Conference from './pages/Conference/Conference';
import Donate from './pages/Donate/Donate';
import ChatLazy from './pages/Chat/ChatLazy';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="what-we-do" element={<WhatWeDo />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="conference" element={<Conference />} />
          <Route path="donate" element={<Donate />} />
          <Route path="research" element={<ChatLazy />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
