import { useEffect, useState } from 'react';

export type OnlineStatusMessage =
  'オフラインでも あそべるよ' | 'つながったよ' | null;

type OnlineStatus = {
  isOnline: boolean;
  message: OnlineStatusMessage;
};

const ONLINE_MESSAGE_DURATION_MS = 3000;

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [message, setMessage] = useState<OnlineStatusMessage>(
    navigator.onLine ? null : 'オフラインでも あそべるよ',
  );

  useEffect(() => {
    let timerId: number | undefined;

    const handleOffline = () => {
      window.clearTimeout(timerId);
      setIsOnline(false);
      setMessage('オフラインでも あそべるよ');
    };

    const handleOnline = () => {
      setIsOnline(true);
      setMessage('つながったよ');
      timerId = window.setTimeout(() => {
        setMessage(null);
      }, ONLINE_MESSAGE_DURATION_MS);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { isOnline, message };
}
