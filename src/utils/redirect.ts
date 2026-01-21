import { useEffect, useState } from 'react';
import * as api from '../api';

interface SessionCheck {
  loading: boolean;
  found: boolean | undefined;
}

const useRedirect = (): SessionCheck => {
  const [sessionCheck, setSessionCheck] = useState<SessionCheck>({
    loading: true,
    found: undefined,
  });

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getScimSessionStatus();

        if (!data.sessionFileFound) {
          setSessionCheck({ loading: false, found: false });
        }

        if (data.sessionFileFound) {
          setSessionCheck({ loading: false, found: true });
        }
      } catch (error) {
        console.error('Failed to check for scimsession file: ', error);
        setSessionCheck({ loading: false, found: undefined });
      }
    })();
  }, []);

  return sessionCheck;
};

export default useRedirect;
