import { useState } from 'react';
import { Activity, Bug, ChevronLeft, Code2, FolderGit2, LayoutDashboard, MessageSquareText, Plus, Settings2, Stethoscope } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/connect', label: 'Connect repository', icon: Plus },
  { to: '/repositories/meridian-api', label: 'Repository explorer', icon: FolderGit2 },
  { to: '/chat', label: 'AI code chat', icon: MessageSquareText },
  { to: '/bugs', label: 'Bug reports', icon: Bug, count: '11' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand-row">
        <span className="brand-symbol"><Stethoscope size={19} strokeWidth={2.2} /></span>
        {!collapsed && <div className="brand-name">code<span>doctor</span></div>}
        <button className="icon-button collapse-button" aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="workspace-switch">
        <span className="workspace-avatar">A</span>
        {!collapsed && <><span className="workspace-name">Acme workspace</span><span className="workspace-chevron">⌄</span></>}
      </div>
      <div className="nav-caption">{!collapsed && 'WORKSPACE'}</div>
      <nav className="side-nav">
        {navigation.map(({ to, label, icon: Icon, count }) => (
          <NavLink key={label} to={to} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} />
            {!collapsed && <><span>{label}</span>{count && <span className="nav-count">{count}</span>}</>}
          </NavLink>
        ))}
      </nav>
      <div className="nav-caption secondary-caption">{!collapsed && 'PREFERENCES'}</div>
      <NavLink to="/settings" title={collapsed ? 'Settings' : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Settings2 size={17} strokeWidth={1.8} />{!collapsed && <span>Settings</span>}
      </NavLink>
      <div className="sidebar-bottom">
        <div className="plan-card">
          <div className="plan-icon"><Activity size={15} /></div>
          {!collapsed && <div><strong>Pro workspace</strong><span>74 of 100 analyses used</span><div className="usage-track"><i /></div></div>}
        </div>
        <div className="sidebar-user">
          <div className="avatar">JD</div>
          {!collapsed && <div className="user-copy"><strong>Jordan Davis</strong><span>jordan@acme.dev</span></div>}
          {!collapsed && <Code2 size={16} className="sidebar-user-more" />}
        </div>
      </div>
    </aside>
  );
}
