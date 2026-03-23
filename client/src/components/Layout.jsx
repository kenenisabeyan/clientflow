import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">ClientFlow</div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <span>📊</span> Dashboard
          </Link>
          <Link to="/projects" className={isActive('/projects')}>
            <span>📁</span> Projects
          </Link>
          {user?.role === 'admin' && (
            <Link to="/create-project" className={isActive('/create-project')}>
              <span>➕</span> Create Project
            </Link>
          )}
          <Link to="/activity" className={isActive('/activity')}>
            <span>📋</span> Activity
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            <span>⚙️</span> Settings
          </Link>
          {user?.role === 'admin' && (
            <Link to="/user-management" className={isActive('/user-management')}>
              <span>👥</span> User Management
            </Link>
          )}
          <button onClick={logout} id="logoutBtn">
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <h1 className="page-title">
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/projects' && 'Projects'}
            {location.pathname === '/create-project' && 'Create Project'}
            {location.pathname === '/activity' && 'Activity'}
            {location.pathname === '/settings' && 'Settings'}
            {location.pathname === '/user-management' && 'User Management'}
            {location.pathname.startsWith('/projects/') && 'Project Details'}
          </h1>
          <div className="user-menu">
            <span>{user?.name} ({user?.role})</span>
          </div>
        </header>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}