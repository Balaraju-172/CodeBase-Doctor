import { useState, useEffect } from 'react';
import { Activity, ArrowRight, ArrowUpRight, Bug, CheckCircle2, FileCode2, Plus, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activities, repositories } from '../data/sampleData';
import { PageHeader, RepositoryCard, StatCard, StatusBadge } from '../components/UI';


// API_BASE_URL is currently not defined.
// Add this before export default function Dashboard():

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/stats`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Something went wrong');
        }

        setStats(result.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const filteredRepositories = 
  repositories.filter((repo) => `${repo.owner}/${repo.name} ${repo.language}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page-wrap">
      <PageHeader
        eyebrow="SUNDAY, NOVEMBER 15"
        title={<>Good afternoon, Jordan <span className="wave">✳</span></>}
        description="A clear view of your codebase health, all in one place."
        action={<Link className="button button-primary" to="/connect"><Plus size={16} />Connect repository</Link>}
      />

      <section className="welcome-strip">
        <div className="welcome-icon"><Sparkles size={18} /></div>
        <div className="welcome-copy"><strong>Your codebase, understood.</strong><span>Explore repositories, ask questions, and spot issues before they reach production.</span></div>
        <Link to="/chat" className="welcome-link">Ask your codebase <ArrowRight size={14} /></Link>
        <div className="welcome-orbit orbit-one" /><div className="welcome-orbit orbit-two" />
      </section>

      <section className="stats-grid">
        <StatCard label="Total repositories" value={stats?.totalRepositories} change="+2 this month" icon={Activity} tone="purple" />
        <StatCard label="Files analyzed" value={stats?.filesAnalyzed} change="+186 this week" icon={FileCode2} tone="blue" />
        <StatCard label="Potential bugs" value={stats?.potentialBugs} change="4 need attention" icon={Bug} tone="orange" />
        <StatCard label="Completed analyses" value={stats?.completedAnalyses} change="94% success rate" icon={CheckCircle2} tone="green" />
      </section>

      <section className="dashboard-lower">
        <div className="panel repository-panel">
          <div className="section-heading">
            <div><h2>Recent repositories</h2><p>Your connected projects at a glance</p></div>
            <label className="table-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter repositories" aria-label="Filter repositories" /></label>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>REPOSITORY</th><th>LANGUAGE</th><th>LAST ANALYZED</th><th>STATUS</th><th /></tr></thead>
              <tbody>
                {filteredRepositories.slice(0, 4).map((repo) => (
                  <tr key={repo.id}>
                    <td><Link to={`/repositories/${repo.id}`} className="table-repo"><span className="repo-mark small" style={{ '--repo-color': repo.color }}>{repo.initials}</span><span><strong>{repo.name}</strong><small>{repo.owner}</small></span></Link></td>
                    <td><span className="language-label"><i className="language-dot" style={{ background: repo.color }} />{repo.language}</span></td>
                    <td className="muted-cell">{repo.analyzed}</td>
                    <td><StatusBadge status={repo.status} /></td>
                    <td><Link className="table-view" to={`/repositories/${repo.id}`} aria-label={`View ${repo.name}`}><ArrowUpRight size={16} /></Link></td>
                  </tr>
                ))}
                {filteredRepositories.length === 0 && <tr><td colSpan="5" className="no-results">No repositories match “{query}”.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="panel-footer"><span>Showing {filteredRepositories.length} of 12 repositories</span><Link to="/connect">View all repositories <ArrowRight size={13} /></Link></div>
        </div>

        <aside className="panel activity-panel">
          <div className="section-heading"><div><h2>Recent activity</h2><p>Latest workspace updates</p></div><button className="more-button" aria-label="More activity options">···</button></div>
          <div className="activity-list">
            {activities.map((item) => <div className="activity-item" key={item.title}>
              <span className={`activity-icon ${item.tone}`}>{item.icon === 'check' ? <CheckCircle2 size={15} /> : item.icon === 'bug' ? <Bug size={15} /> : <Activity size={15} />}</span>
              <span className="activity-copy"><strong>{item.title}</strong><span>{item.detail}</span></span>
              <time>{item.time}</time>
            </div>)}
          </div>
          <Link className="activity-all" to="/bugs">View activity <ArrowRight size={13} /></Link>
          <div className="insight-card"><span><Sparkles size={14} /></span><div><strong>Weekly insight</strong><p>You resolved 8 more issues this week than last. Nice work.</p></div></div>
        </aside>
      </section>

      <section className="quick-repos">
        <div className="quick-repos-heading"><div><h2>Pick up where you left off</h2><p>Jump back into a recent project</p></div><Link to="/connect">All repositories <ArrowRight size={13} /></Link></div>
        <div className="repository-cards">{repositories.slice(0, 3).map((repo) => <RepositoryCard key={repo.id} repo={repo} />)}</div>
      </section>
    </div>
  );
}
