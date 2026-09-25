import {
  FiHome,
  FiUsers,
  FiUploadCloud,
  FiClock,
  FiCopy,
  FiAlertTriangle,
  FiDownload,
  FiMoon,
  FiSun,
  FiBell,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

const items = [
  ['dashboard', FiHome, 'Dashboard'],
  ['leads', FiUsers, 'Leads'],
  ['import', FiUploadCloud, 'Import Leads'],
  ['history', FiClock, 'Import History'],
  ['duplicates', FiCopy, 'Duplicates'],
  ['invalid', FiAlertTriangle, 'Invalid Leads'],
  ['export', FiDownload, 'Export Center'],
  ['profile', FiUser, 'Profile']
];

export default function Sidebar({
  page,
  setPage,
  theme,
  toggleTheme,
  user,
  notifications,
  showNotifications,
  onToggleNotifications,
  onReadAll,
  onLogout
}) {
  const unread = notifications.filter(notification => !notification.read).length;

  return (
    <aside>
      <h2>LeadTracker</h2>
      <div className="sidebar-user">
        <strong>{user?.name || user?.email}</strong>
        <span>{user?.role}</span>
      </div>
      <nav>
        {items.map(([id, I, label]) => (
          <button
            className={page === id ? 'nav active' : 'nav'}
            key={id}
            onClick={() => setPage(id)}
          >
            <I />
            {label}
          </button>
        ))}
      </nav>
      <div className="notification-wrap">
        <button className="sidebar-action" onClick={onToggleNotifications}>
          <FiBell />
          Notifications
          {unread > 0 && <span className="notification-badge">{unread}</span>}
        </button>
        {showNotifications && (
          <div className="notification-panel">
            <div className="notification-heading">
              <strong>Notifications</strong>
              {unread > 0 && <button onClick={onReadAll}>Mark all read</button>}
            </div>
            {notifications.length ? (
              notifications.map(notification => (
                <div
                  className={notification.read ? 'notification' : 'notification unread'}
                  key={notification._id}
                >
                  <FiBell />
                  <div>
                    <b>{notification.message}</b>
                    <small>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : ''}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="notification-empty">No notifications yet.</p>
            )}
          </div>
        )}
      </div>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
      <button className="logout-button" onClick={onLogout}>
        <FiLogOut /> Logout
      </button>
    </aside>
  );
}
