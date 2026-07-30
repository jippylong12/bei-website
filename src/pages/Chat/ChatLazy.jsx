import { Suspense, lazy } from 'react';

// Loaded on demand so the markdown renderer stays out of the main bundle.
const Chat = lazy(() => import('./Chat'));

export default function ChatLazy() {
  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  );
}
