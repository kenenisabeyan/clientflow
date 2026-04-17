import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, FolderKanban, CheckSquare, 
  FileText, Calendar as CalendarIcon, MessageSquare, 
  FileText, Calendar as CalendarIcon, MessageSquare, 
  BarChart2, Settings as SettingsIcon, LogOut, Bell, Search, Sun, Moon
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/clients')) return 'Customers';
    if (path.includes('/projects')) return 'Projects';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/invoices')) return 'Invoices';
    if (path.includes('/calendar')) return 'Calendar';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/settings')) return 'Settings';
    return 'FollowFlow';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.25rem', borderRadius: '0.375rem', marginRight: '0.5rem', display: 'inline-flex' }}>
            <LayoutDashboard size={20} />
          </div>
          FollowFlow
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
          <Link to="/clients" className={isActive('/clients')}><Users size={18} /> Customers</Link>
          <Link to="/projects" className={isActive('/projects')}><FolderKanban size={18} /> Projects</Link>
          <Link to="/tasks" className={isActive('/tasks')}><CheckSquare size={18} /> Tasks</Link>
          <Link to="/invoices" className={isActive('/invoices')}><FileText size={18} /> Invoices</Link>
          <Link to="/calendar" className={isActive('/calendar')}><CalendarIcon size={18} /> Calendar</Link>
          <Link to="/messages" className={isActive('/messages')}><MessageSquare size={18} /> Messages</Link>
          <Link to="/reports" className={isActive('/reports')}><BarChart2 size={18} /> Reports</Link>
          <Link to="/settings" className={isActive('/settings')}><SettingsIcon size={18} /> Settings</Link>
          
          <div style={{flex: 1}}></div>
          
          <button onClick={logout} className="logout-btn mt-auto" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500
          }}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--surface-border)' }}>
               <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
               <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }} />
             </div>
             
             <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
                <Bell size={20} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
             </button>
             <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {user?.name?.charAt(0) || 'U'}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name || 'User'}</span>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || 'Admin'}</span>
               </div>
             </div>
          </div>
        </header>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}