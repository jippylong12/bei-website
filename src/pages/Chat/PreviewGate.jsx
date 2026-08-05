import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPreviewAccess } from '../../config/preview';
import ChatLazy from './ChatLazy';

// Gate in front of BitResearch. Visitors holding the preview link get the app;
// everyone else is sent to the home page, as if the route did not exist.
// See src/config/preview.js for what this does and does not protect.
export default function PreviewGate() {
  const { search } = useLocation();
  const allowed = hasPreviewAccess(search);

  // Belt-and-braces alongside robots.txt: keep the preview out of search
  // results even if the link leaks into somewhere a crawler follows.
  useEffect(() => {
    if (!allowed) return;

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => meta.remove();
  }, [allowed]);

  if (!allowed) return <Navigate to="/" replace />;

  return <ChatLazy />;
}
