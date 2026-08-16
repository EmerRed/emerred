import { useEffect, useRef } from 'react';
import { removeAuthToken } from '@/data/auth';

const IDLE_LIMIT = 10 * 60 * 1000; // 10 minutos

export function useIdleTimeout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function logout() {
      removeAuthToken();
      window.location.reload();
    }

    function resetTimer() {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(logout, IDLE_LIMIT);
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];

    resetTimer();
    events.forEach(evt => window.addEventListener(evt, resetTimer));

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, []);
}
