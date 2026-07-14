import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { hasResearchPreview } from '../../config/preview';

// Loaded on demand so the markdown renderer stays out of the main bundle.
const Chat = lazy(() => import('./Chat'));

export default function ChatLazy() {
  if (!hasResearchPreview()) return <Navigate to="/" replace />;

  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  );
}
