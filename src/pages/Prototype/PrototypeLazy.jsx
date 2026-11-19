import { Suspense, lazy, useEffect } from 'react';

// Loaded on demand so the markdown renderer stays out of the main bundle.
const Prototype = lazy(() => import('./Prototype'));

const PROTOTYPE_TITLE = 'BitResearch prototype · Bitcoin Education Institute';

export default function PrototypeLazy() {
  // The same posture as /BitResearch (see ChatLazy): /prototype loads for
  // anyone with the link, but nothing on btcedu.org links to it (it is not in
  // the header menu), and this noindex plus the Disallow in public/robots.txt
  // keep it out of search results. The tab gets the page's own title while it
  // is open.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    const previousTitle = document.title;
    document.title = PROTOTYPE_TITLE;

    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <Prototype />
    </Suspense>
  );
}
