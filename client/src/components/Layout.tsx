import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, FolderKanban, CheckSquare, 
  FileText, Calendar as CalendarIcon, MessageSquare, 
  BarChart2, Settings as SettingsIcon, LogOut, Bell, Search, Sun, Moon, ArrowUp,
  CheckCircle2, AlertCircle, Clock, Check
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Role-specific notifications
  const [notifications, setNotifications] = useState([
    ...(user?.role === 'admin' ? [
      { id: 1, text: 'Delelegn paid Invoice INV-0001 ($5,000)', time: '10m ago', unread: true, type: 'payment' },
      { id: 2, text: 'Kidane completed task: API route configuration', time: '1h ago', unread: true, type: 'task' },
      { id: 3, text: 'New client inquiry in #client-support', time: '2h ago', unread: false, type: 'message' },
    ] : user?.role === 'client' ? [
      { id: 1, text: 'Your invoice INV-0001 has been confirmed Paid', time: '10m ago', unread: true, type: 'payment' },
      { id: 2, text: 'Project milestone reached: Database & API ready', time: '1h ago', unread: true, type: 'task' },
      { id: 3, text: 'New broadcast in #general channel', time: '1d ago', unread: false, type: 'message' },
    ] : [
      { id: 1, text: 'New sprint task assigned to your queue', time: '30m ago', unread: true, type: 'task' },
      { id: 2, text: 'Sprint velocity updated for current milestone', time: '2h ago', unread: true, type: 'task' },
      { id: 3, text: 'New technical thread in #dev-team', time: '5h ago', unread: false, type: 'message' },
    ])
  ]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const isActive = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/clients')) return 'Customers';
    if (path.match(/\/projects\/[a-zA-Z0-9_-]+/)) return 'Project 360° Portal';
    if (path.includes('/projects')) return 'Projects';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/invoices')) return 'Invoices';
    if (path.includes('/calendar')) return 'Calendar';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/settings')) return 'Settings';
    return 'ClientFlow';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.25rem', borderRadius: '0.375rem', marginRight: '0.5rem', display: 'inline-flex' }}>
            <LayoutDashboard size={20} />
          </div>
          ClientFlow
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
          {user?.role === 'admin' && (
            <Link to="/clients" className={isActive('/clients')}><Users size={18} /> Customers</Link>
          )}
          <Link to="/projects" className={isActive('/projects')}><FolderKanban size={18} /> {user?.role === 'client' ? 'My Projects' : 'Projects'}</Link>
          <Link to="/tasks" className={isActive('/tasks')}><CheckSquare size={18} /> {user?.role === 'client' ? 'My Tasks' : 'Tasks'}</Link>
          {user?.role !== 'developer' && (
            <Link to="/invoices" className={isActive('/invoices')}><FileText size={18} /> Invoices</Link>
          )}
          <Link to="/calendar" className={isActive('/calendar')}><CalendarIcon size={18} /> Calendar</Link>
          <Link to="/messages" className={isActive('/messages')}><MessageSquare size={18} /> Messages</Link>
          {user?.role === 'admin' && (
            <Link to="/reports" className={isActive('/reports')}><BarChart2 size={18} /> Reports</Link>
          )}
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

             {/* Notifications Bell with Interactive Dropdown */}
             <div style={{ position: 'relative' }} ref={notifRef}>
               <button
                 onClick={() => setIsNotifOpen(!isNotifOpen)}
                 style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative', display: 'flex', padding: '0.25rem' }}
                 title="Notifications"
               >
                 <Bell size={20} />
                 {unreadCount > 0 && (
                   <span style={{
                     position: 'absolute',
                     top: '-2px',
                     right: '-2px',
                     minWidth: '16px',
                     height: '16px',
                     background: 'var(--primary)',
                     color: '#fff',
                     fontSize: '0.65rem',
                     fontWeight: 700,
                     borderRadius: '8px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     padding: '0 3px'
                   }}>
                     {unreadCount}
                   </span>
                 )}
               </button>

               {/* Dropdown Menu */}
               {isNotifOpen && (
                 <div style={{
                   position: 'absolute',
                   right: 0,
                   top: '2.5rem',
                   width: '320px',
                   background: 'var(--surface)',
                   border: '1px solid var(--surface-border)',
                   borderRadius: '10px',
                   boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                   zIndex: 60,
                   overflow: 'hidden',
                   animation: 'fadeIn 0.2s ease-out'
                 }}>
                   <div style={{
                     padding: '0.85rem 1rem',
                     borderBottom: '1px solid var(--surface-border)',
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                   }}>
                     <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Notifications</span>
                     {unreadCount > 0 && (
                       <button
                         onClick={markAllRead}
                         style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                       >
                         Mark all read
                       </button>
                     )}
                   </div>

                   <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                     {notifications.length === 0 ? (
                       <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                         No notifications
                       </div>
                     ) : (
                       notifications.map(n => (
                         <div
                           key={n.id}
                           style={{
                             padding: '0.75rem 1rem',
                             borderBottom: '1px solid var(--surface-border)',
                             background: n.unread ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                             display: 'flex',
                             alignItems: 'flex-start',
                             gap: '0.65rem',
                             fontSize: '0.82rem',
                             cursor: 'pointer'
                           }}
                           onClick={() => {
                             setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                           }}
                         >
                           <div style={{
                             width: '8px',
                             height: '8px',
                             borderRadius: '50%',
                             background: n.unread ? 'var(--primary)' : 'transparent',
                             marginTop: '0.35rem',
                             flexShrink: 0
                           }} />
                           <div style={{ flex: 1 }}>
                             <div style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>{n.text}</div>
                             <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>{n.time}</div>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               )}
             </div>

             <div
               className="user-menu"
               onClick={() => navigate('/settings')}
               style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
               title="Account Settings"
             >
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                 {user?.name?.charAt(0) || 'U'}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name || 'User'}</span>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role?.toUpperCase() || 'ADMIN'}</span>
               </div>
             </div>
          </div>
        </header>
        <div className="container">
          <Outlet />
        </div>

        {/* Floating Right-Side Corner Scroll Sticker / Action Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            title="Scroll to Top"
            className="scroll-to-top-sticker"
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.45)',
              zIndex: 90,
              transition: 'all 0.25s ease',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <ArrowUp size={22} />
          </button>
        )}
      </div>
    </div>
  );
}