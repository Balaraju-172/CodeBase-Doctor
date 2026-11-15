import { ArrowUpRight, Clock3, ExternalLink, FileCode2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, change, icon: Icon, tone }) {
  return (
    <article className="panel stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
      <span className="stat-label">{label}</span>
      <div className="stat-bottom">
        <strong>{value}</strong>
        <span className="stat-change">{change}</span>
      </div>
    </article>
  );
}

export function StatusBadge({ status }) {
  const tone = status === 'Completed' || status === 'Resolved' ? 'success' : status === 'Open' || status === 'In progress' ? 'progress' : 'neutral';
  return <span className={`status-badge ${tone}`}><span />{status}</span>;
}

export function SeverityBadge({ severity }) {
  return <span className={`severity-badge ${severity.toLowerCase()}`}><span className="severity-mark" />{severity}</span>;
}

export function RepositoryCard({ repo }) {
  return (
    <Link className="panel repository-card" to={`/repositories/${repo.id}`}>
      <div className="repo-card-top">
        <span className="repo-mark" style={{ '--repo-color': repo.color }}>{repo.initials}</span>
        <span className="repo-open"><ArrowUpRight size={16} /></span>
      </div>
      <h3>{repo.owner}/{repo.name}</h3>
      <p>{repo.description}</p>
      <div className="repo-card-meta">
        <span><i className="language-dot" style={{ background: repo.color }} />{repo.language}</span>
        <span><Clock3 size={13} />{repo.analyzed}</span>
      </div>
    </Link>
  );
}

export function EmptyState({ icon: Icon = FileCode2, title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={21} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function TextLink({ to, children }) {
  return <Link className="text-link" to={to}>{children}<ExternalLink size={13} /></Link>;
}
