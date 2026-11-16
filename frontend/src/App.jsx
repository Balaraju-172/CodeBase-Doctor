import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ConnectRepository from './pages/ConnectRepository';
import RepositoryExplorer from './pages/RepositoryExplorer';
import Chat from './pages/Chat';
import BugReports from './pages/BugReports';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connect" element={<ConnectRepository />} />
        <Route
            path="/repositories/:owner/:repo"
            element={<RepositoryExplorer />}
        />      
        <Route path="/chat" element={<Chat />} />
        <Route path="/bugs" element={<BugReports />} />
        <Route path="/settings" element={<PlaceholderPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function PlaceholderPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>Settings</h1>
          <p>Workspace preferences will be available here.</p>
        </div>
      </div>
      <section className="panel empty-settings">
        <div className="empty-icon"><span className="status-dot" /></div>
        <h2>Settings are coming soon</h2>
        <p>This demo is focused on the codebase exploration experience.</p>
      </section>
    </div>
  );
}
