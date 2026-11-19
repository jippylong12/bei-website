import { useEffect, useState } from 'react';
import { PROTOTYPE_API_BASE } from '../../config/prototypeApi';

// GET one JSON endpoint of the prototype API once, when the page mounts, and
// run it through `parse` (prototypeData.js). status is 'loading', then 'ready'
// with the parsed data, or 'unavailable' (an error status such as 404, a
// network failure, or a payload `parse` rejects).
export default function usePrototypeApi(path, parse) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${PROTOTYPE_API_BASE}${path}`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json == null ? null : parse(json);
        setState(data ? { status: 'ready', data } : { status: 'unavailable', data: null });
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') setState({ status: 'unavailable', data: null });
      });
    return () => ctrl.abort();
  }, [path, parse]);

  return state;
}
