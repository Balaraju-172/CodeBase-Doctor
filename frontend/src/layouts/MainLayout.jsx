import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <div className={`sidebar-slot ${mobileNavOpen ? 'mobile-open' : ''}`}><Sidebar /></div>
      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <div className="main-column">
        <Navbar onMenu={() => setMobileNavOpen(!mobileNavOpen)} />
        <main className="main-content" key={location.pathname}><Outlet /></main>
      </div>
    </div>
  );
}
