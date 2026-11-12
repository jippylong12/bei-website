import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// A new page fades up into place; the old one is simply replaced.
//
// There is deliberately no exit animation. With AnimatePresence the leaving
// <main> kept rendering <Outlet />, which already shows the NEW page: the new
// page flashed in, faded out to a blank screen, then mounted and faded in a
// second time (fetching its data twice). Without an exit there is one mount
// and one fade.
//
// The key is the path only, so a change of query (?year=2026 on Conference,
// ?tab= and ?folder= in the faculty Portal) changes what a page shows without
// counting as a new page.
export default function App() {
  const { pathname } = useLocation();

  // Before paint, so the new page never shows for a frame at the old page's
  // scroll position.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </>
  );
}
