import { Suspense, lazy, useEffect } from 'react';

// Loaded on demand so the markdown renderer stays out of the main bundle.
const Chat = lazy(() => import('./Chat'));

export default function ChatLazy() {
  // BitResearch is unlinked, not private: /BitResearch loads for anyone who has
  // the URL, but nothing on btcedu.org points at it — it is absent from the
  // header nav and not linked from any page. This noindex (alongside the
  // Disallow in public/robots.txt) is what keeps it out of search results, so
  // the only way in is a link someone gives you.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => meta.remove();
  }, []);

  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  );
}
