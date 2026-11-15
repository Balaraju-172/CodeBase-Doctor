import { useMemo, useState } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Bug, Check, ChevronDown, CircleDot, FileCode2, Filter, Search, ShieldAlert, X } from 'lucide-react';
import { bugs } from '../data/sampleData';
import { PageHeader, SeverityBadge, StatusBadge } from '../components/UI';

const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

export default function BugReports() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All severities');
  const [selectedBug, setSelectedBug] = useState(null);
  const [sortAscending, setSortAscending] = useState(true);

  const visibleBugs = useMemo(() => bugs.filter((bug) => {
    const matchesText = `${bug.title} ${bug.file} ${bug.repository} ${bug.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (severity === 'All severities' || bug.severity === severity);
  }).sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity) || (sortAscending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id))), [query, severity, sortAscending]);

  return (
    <div className="page-wrap bugs-page">
      <PageHeader eyebrow="CODE HEALTH" title="Bug reports" description="Potential issues found across your connected repositories." action={<span className="demo-label"><CircleDot size={8} fill="currentColor" />SAMPLE REPORTS</span>} />
      <section className="bug-stats">
        <article className="panel bug-stat"><span className="bug-stat-icon critical-bg"><ShieldAlert size={17} /></span><div><span>Critical</span><strong>1</strong></div><small>Needs immediate attention</small></article>
        <article className="panel bug-stat"><span className="bug-stat-icon high-bg"><AlertCircle size={17} /></span><div><span>High severity</span><strong>3</strong></div><small>Review recommended</small></article>
        <article className="panel bug-stat"><span className="bug-stat-icon medium-bg"><CircleDot size={17} /></span><div><span>Medium severity</span><strong>5</strong></div><small>Potential improvements</small></article>
        <article className="panel bug-stat"><span className="bug-stat-icon low-bg"><Check size={17} /></span><div><span>Resolved</span><strong>8</strong></div><small>Across all repositories</small></article>
      </section>
      <section className="panel bugs-table-panel">
        <div className="bugs-table-heading"><div><h2>Detected issues</h2><p>11 total findings across your repositories</p></div><div className="bug-filters">
          <label className="table-search bug-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search issues..." aria-label="Search issues" /></label>
          <label className="severity-select"><Filter size={14} /><select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity"><option>All severities</option>{severityOrder.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
        </div></div>
        <div className="table-scroll"><table className="data-table bugs-table"><thead><tr><th><button onClick={() => setSortAscending(!sortAscending)}>ISSUE <ArrowDown size={12} /></button></th><th>SEVERITY</th><th>REPOSITORY</th><th>LOCATION</th><th>STATUS</th><th /></tr></thead>
          <tbody>{visibleBugs.map((bug) => <tr key={bug.id} className="bug-row" onClick={() => setSelectedBug(bug)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedBug(bug); }}>
            <td><div className="bug-title-cell"><span className={`bug-row-icon ${bug.severity.toLowerCase()}`}><Bug size={14} /></span><span><strong>{bug.title}</strong><small>{bug.id}</small></span></div></td>
            <td><SeverityBadge severity={bug.severity} /></td><td className="muted-cell">{bug.repository}</td>
            <td><span className="file-location-cell"><FileCode2 size={13} />{bug.file}<small>:{bug.line}</small></span></td><td><StatusBadge status={bug.status} /></td><td><span className="bug-open-arrow"><ArrowUp size={14} /></span></td>
          </tr>)}
          {visibleBugs.length === 0 && <tr><td colSpan="6"><div className="bug-no-results"><Bug size={18} /><strong>No matching issues</strong><span>Try a different search or severity filter.</span></div></td></tr>}</tbody>
        </table></div>
        <div className="panel-footer"><span>Showing {visibleBugs.length} of {bugs.length} sample findings</span><span>Last updated just now</span></div>
      </section>
      <p className="bug-disclaimer"><AlertCircle size={13} />Findings are illustrative mock data and do not represent real repository analysis.</p>
      {selectedBug && <BugDetail bug={selectedBug} onClose={() => setSelectedBug(null)} />}
    </div>
  );
}

function BugDetail({ bug, onClose }) {
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="bug-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="bug-detail-title">
        <div className="drawer-header"><span>ISSUE DETAILS</span><button className="icon-button" onClick={onClose} aria-label="Close issue details"><X size={18} /></button></div>
        <div className="drawer-content">
          <div className="drawer-issue-meta"><SeverityBadge severity={bug.severity} /><span>{bug.id}</span></div>
          <h2 id="bug-detail-title">{bug.title}</h2>
          <StatusBadge status={bug.status} />
          <div className="drawer-file"><FileCode2 size={15} /><span>{bug.file}</span><strong>Line {bug.line}</strong></div>
          <DetailSection title="Description" text={bug.description} />
          <DetailSection title="Why it might be a problem" text={bug.why} />
          <DetailSection title="Root cause" text={bug.rootCause} />
          <div className="suggested-fix"><span><Check size={14} />SUGGESTED FIX</span><p>{bug.fix}</p></div>
          <div className="drawer-sample-note"><AlertCircle size={14} />This report is mock content for the UI demo, not an actual finding.</div>
        </div>
        <div className="drawer-footer"><button className="button button-secondary" onClick={onClose}>Close</button><button className="button button-primary" onClick={onClose}>Got it</button></div>
      </aside>
    </div>
  );
}

function DetailSection({ title, text }) {
  return <section className="detail-section"><h3>{title}</h3><p>{text}</p></section>;
}
