import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import { ACCESS_TOKEN_KEY } from '../services/types';

const DEFAULT_WARNING_MS = 25 * 60 * 1000; // 25 minutes of inactivity
const DEFAULT_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
];

export interface UseSessionTimeoutOptions {
  warningMs?: number;
  logoutMs?: number;
}

export interface UseSessionTimeoutResult {
  showWarning: boolean;
  secondsRemaining: number;
  extendSession: () => Promise<void>;
}

function useSessionTimeout(options?: UseSessionTimeoutOptions): UseSessionTimeoutResult {
  const warningMs = options?.warningMs ?? DEFAULT_WARNING_MS;
  const logoutMs = options?.logoutMs ?? DEFAULT_LOGOUT_MS;

  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.max(0, Math.round((logoutMs - warningMs) / 1000))
  );

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const doLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    try {
      await logout();
    } catch {
      // Ignore network errors during forced logout; still clear local state.
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    navigate('/login', { replace: true });
  }, [clearAllTimers, navigate]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsRemaining(Math.max(0, Math.round((logoutMs - warningMs) / 1000)));

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const remainingMs = logoutMs - warningMs;
      setSecondsRemaining(Math.max(0, Math.round(remainingMs / 1000)));

      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      logoutTimerRef.current = setTimeout(() => {
        void doLogout();
      }, remainingMs);
    }, warningMs);
  }, [clearAllTimers, doLogout, logoutMs, warningMs]);

  const handleActivity = useCallback(() => {
    if (!showWarning) {
      startTimers();
    }
  }, [showWarning, startTimers]);

  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return undefined;
    }

    startTimers();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extendSession = useCallback(async () => {
    try {
      await getSession();
    } catch {
      // If the session can no longer be refreshed, force logout immediately.
      await doLogout();
      return;
    }
    startTimers();
  }, [doLogout, startTimers]);

  return { showWarning, secondsRemaining, extendSession };
}

export default useSessionTimeout;
