import React, { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/layout/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import ImportLeadsPage from './pages/ImportLeadsPage.jsx';
import ImportHistoryPage from './pages/ImportHistoryPage.jsx';
import DuplicatesPage from './pages/DuplicatesPage.jsx';
import InvalidLeadsPage from './pages/InvalidLeadsPage.jsx';
import ExportCenterPage from './pages/ExportCenterPage.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('lead-tracker-theme') || 'light'
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lead-tracker-user'));
    } catch {
      return null;
    }
  });
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unique: 0,
    duplicates: 0,
    invalid: 0
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lead-tracker-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('lead-tracker-token');
    const s = io(API, { auth: { token } });

    fetch(API + '/api/notifications', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : []))
      .then(setNotifications)
      .catch(() => {});
    s.on('connect', () =>
      setEvents(x => ['Realtime connection established', ...x].slice(0, 8))
    );
    s.on('system:ready', d =>
      setEvents(x => [d.message, ...x].slice(0, 8))
    );
    s.on('import:progress', d =>
      setEvents(x => [`Import ${d.batchId}: ${d.progress}%`, ...x].slice(0, 8))
    );
    s.on('lead:created', () =>
      setStats(x => ({ ...x, total: x.total + 1, unique: x.unique + 1 }))
    );
    s.on('notification:created', notification => {
      setNotifications(x => [notification, ...x]);
      setEvents(x => [notification.message, ...x].slice(0, 8));
    });

    return () => s.disconnect();
  }, [user]);

  const onGoogleLogin = useCallback(async credential => {
    const r = await fetch(API + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await r.json();

    if (!r.ok) return alert(data.message || 'Google sign-in failed');

    localStorage.setItem('lead-tracker-token', data.token);
    localStorage.setItem('lead-tracker-user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const saveAuth = data => {
    localStorage.setItem('lead-tracker-token', data.token);
    localStorage.setItem('lead-tracker-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const emailAuth = async (endpoint, payload) => {
    const r = await fetch(API + '/api/auth/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();

    if (!r.ok) return alert(data.message || 'Authentication failed');

    saveAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('lead-tracker-token');
    localStorage.removeItem('lead-tracker-user');
    setNotifications([]);
    setShowNotifications(false);
    setUser(null);
  };

  const readAllNotifications = async () => {
    const token = localStorage.getItem('lead-tracker-token');
    const r = await fetch(API + '/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + token }
    });

    if (r.ok) {
      setNotifications(x => x.map(notification => ({ ...notification, read: true })));
    }
  };

  if (!user) {
    return authPage === 'signup' ? (
      <SignupPage
        onSignup={p => emailAuth('register', p)}
        onShowLogin={() => setAuthPage('login')}
      />
    ) : (
      <LoginPage
        onGoogleLogin={onGoogleLogin}
        onLogin={p => emailAuth('login', p)}
        onShowSignup={() => setAuthPage('signup')}
      />
    );
  }

  const pages = {
    dashboard: <DashboardPage stats={stats} events={events} />,
    leads: <LeadsPage />,
    import: <ImportLeadsPage />,
    history: <ImportHistoryPage />,
    duplicates: <DuplicatesPage />,
    invalid: <InvalidLeadsPage />,
    export: <ExportCenterPage />
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        theme={theme}
        toggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        user={user}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(value => !value)}
        onReadAll={readAllNotifications}
        onLogout={logout}
      />
      <main>{pages[page]}</main>
    </div>
  );
}
