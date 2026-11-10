import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore failed logout requests; session should clear on the client state anyway.
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const sessionRes = await fetch(`${API}/session`, { credentials: 'include' });
      const sessionData = await sessionRes.json().catch(() => ({}));

      if (sessionData?.user) {
        setUser(sessionData.user);
        return sessionData.user;
      }

      const refreshRes = await fetch(`${API}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        setUser(null);
        return null;
      }

      const refreshedSession = await fetch(`${API}/session`, { credentials: 'include' });
      const refreshedData = await refreshedSession.json().catch(() => ({}));

      if (refreshedData?.user) {
        setUser(refreshedData.user);
        return refreshedData.user;
      }

      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let live = true;

    const init = async () => {
      if (!live) return;
      await refreshUser();
      if (live) setLoading(false);
    };

    init();

    return () => {
      live = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return undefined;

    const idleMinutes = Number(import.meta.env.VITE_IDLE_MINUTES || 15);
    const idleMs = Math.max(1000, idleMinutes * 60 * 1000);
    const pingMs = Math.max(5000, Math.floor(idleMs / 3));
    let timeoutId = null;
    let pingId = null;

    const goIdle = async () => {
      await logout();
      navigate('/login?reason=idle', { replace: true });
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(goIdle, idleMs);
    };

    const pingSession = async () => {
      try {
        const res = await fetch(`${API}/session`, { credentials: 'include' });
        const data = await res.json().catch(() => ({}));

        if (!data?.user) {
          await goIdle();
          return;
        }
      } catch {
        await goIdle();
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();
    pingId = setInterval(pingSession, pingMs);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
      if (pingId) clearInterval(pingId);
    };
  }, [logout, navigate, user]);

  const value = useMemo(
    () => ({ user, loading, refreshUser, logout, isLoggedIn: !!user }),
    [logout, refreshUser, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
