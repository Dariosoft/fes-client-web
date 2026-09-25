import { useEffect, type ReactNode } from 'react';
import { useIdentity } from './IdentityContext';
import { fetchCurrentSession } from './session';

/**
 * On mount (and remount / reload), asks accounts who the visitor is
 * and hydrates in-memory identity state from that response only.
 */
export function IdentityHydrator({ children }: { children: ReactNode }) {
  const { setLoading, setSession } = useIdentity();

  useEffect(() => {
    let cancelled = false;

    setLoading();

    void (async () => {
      const session = await fetchCurrentSession();
      if (!cancelled) {
        setSession(session);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setLoading, setSession]);

  return children;
}
