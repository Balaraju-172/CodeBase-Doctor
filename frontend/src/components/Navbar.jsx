import { useState } from 'react';
import { Bell, ChevronDown, Command, Menu, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/connect': 'Connect repository',
  '/chat': 'AI code chat',
  '/bugs': 'Bug reports',
  '/settings': 'Settings',
};

export default function Navbar({ onMenu }) {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const title = location.pathname.startsWith('/repositories/') ? 'Repository explorer' : titles[location.pathname] || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={19} /></button>
        <span className="breadcrumb-muted">Workspace</span><span className="breadcrumb-divider">/</span><strong>{title}</strong>
      </div>
      <div className="topbar-right">
        <label className="global-search">
          <Search size={15} />
          <input type="search" placeholder="Search anything..." aria-label="Search" />
          <span className="search-shortcut"><Command size={11} /> K</span>
        </label>
        <div className="topbar-popover-wrap">
          <button className={`icon-button notification-button ${notificationsOpen ? 'selected' : ''}`} aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}>
            <Bell size={17} /><i />
          </button>
          {notificationsOpen && <div className="popover notification-popover"><strong>Notifications</strong><p><span className="notification-dot" />3 potential issues found in <b>papertrail-web</b></p><p><span className="notification-dot purple-dot" />Analysis completed for <b>meridian-api</b></p><small>These are sample notifications.</small></div>}
        </div>
        <div className="topbar-popover-wrap">
          <button className="profile-button" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}>
            <span className="avatar">JD</span><span className="profile-name">Jordan Davis</span><ChevronDown size={14} />
          </button>
          {profileOpen && <div className="popover profile-popover"><strong>Jordan Davis</strong><span>jordan@acme.dev</span><hr /><button onClick={() => setProfileOpen(false)}>Workspace preferences</button><button onClick={() => setProfileOpen(false)}>Close menu</button></div>}
        </div>
      </div>
    </header>
  );
}
