import { useEffect, useState } from 'react';
import { parseHash, type Route } from './hashRoute';

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', sync);

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/');
    }

    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return route;
}
