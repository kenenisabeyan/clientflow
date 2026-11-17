import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import BrandLogo, { BrandIcon } from './BrandLogo';
import UserAvatar from './UserAvatar';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  FileText, Calendar as CalendarIcon, MessageSquare,
  BarChart2, Settings as SettingsIcon, LogOut, Bell, Search, Sun, Moon, ArrowUp,
  CheckCircle2, AlertCircle, Clock, History, ShieldCheck, X, Menu
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Omnisearch State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    projects: any[];
    tasks: any[];
    invoices: any[];
    users: any[];
  }>({ projects: [], tasks: [], invoices: [], users: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Global Keyboard shortcut: Ctrl+K or Cmd+K focuses Omnisearch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Live Omnisearch across ERP entities
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults({ projects: [], tasks: [], invoices: [], users: [] });
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim().toLowerCase();
        const calls: Promise<any>[] = [
          api.get('/projects').catch(() => ({ data: { projects: [] } })),
          api.get('/tasks').catch(() => ({ data: { tasks: [] } })),
        ];

        if (user?.role !== 'developer') {
          calls.push(api.get('/invoices').catch(() => ({ data: { invoices: [] } })));
        }
        if (user?.role === 'admin') {
          calls.push(api.get('/users').catch(() => ({ data: { users: [] } })));
        }

        const results = await Promise.allSettled(calls);

        let pList: any[] = [];
        let tList: any[] = [];
        let iList: any[] = [];
        let uList: any[] = [];

        if (results[0].status === 'fulfilled') {
          const raw = results[0].value.data.projects || [];
          pList = raw.filter((p: any) =>
            p.title?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          ).slice(0, 4);
        }

        if (results[1].status === 'fulfilled') {
          const raw = results[1].value.data.tasks || [];
          tList = raw.filter((t: any) =>
            t.title?.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
          ).slice(0, 4);
        }

        if (user?.role !== 'developer' && results[2]?.status === 'fulfilled') {
          const raw = results[2].value.data.invoices || [];
          iList = raw.filter((inv: any) =>
            (inv.invoiceNumber || '').toLowerCase().includes(query) ||
            (inv.client?.name || '').toLowerCase().includes(query)
          ).slice(0, 3);
        }

        const userIdx = user?.role !== 'developer' ? 3 : 2;
        if (user?.role === 'admin' && results[userIdx]?.status === 'fulfilled') {
          const raw = results[userIdx].value.data.users || [];
          uList = raw.filter((u: any) =>
            u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query)
          ).slice(0, 3);
        }

        setSearchResults({ projects: pList, tasks: tList, invoices: iList, users: uList });
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Omnisearch error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.role]);

  // Role-specific notifications with live Atlas synchronization
  const [notifications, setNotifications] = useState([
    ...(user?.role === 'admin' ? [
      { id: 1, text: 'Delelegn paid Invoice INV-0001 ($5,000)', time: '10m ago', unread: true, type: 'payment', path: '/invoices' },
      { id: 2, text: 'Kidane completed task: API route configuration', time: '1h ago', unread: true, type: 'task', path: '/tasks' },
      { id: 3, text: 'New client inquiry in #client-support', time: '2h ago', unread: false, type: 'message', path: '/messages' },
    ] : user?.role === 'client' ? [
      { id: 1, text: 'Your invoice INV-0001 has been confirmed Paid', time: '10m ago', unread: true, type: 'payment', path: '/invoices' },
      { id: 2, text: 'Project milestone reached: Database & API ready', time: '1h ago', unread: true, type: 'task', path: '/tasks' },
      { id: 3, text: 'New broadcast in #general channel', time: '1d ago', unread: false, type: 'message', path: '/messages' },
    ] : [
      { id: 1, text: 'New sprint task assigned to your queue', time: '30m ago', unread: true, type: 'task', path: '/tasks' },
      { id: 2, text: 'Sprint velocity updated for current milestone', time: '2h ago', unread: true, type: 'task', path: '/tasks' },
      { id: 3, text: 'New technical thread in #dev-team', time: '5h ago', unread: false, type: 'message', path: '/messages' },
    ])
  ]);

  // Synchronize live notifications from Atlas Activity feed
  useEffect(() => {
    const fetchLiveNotifications = async () => {
      try {
        const res = await api.get('/activity?limit=6');
        if (res.data?.activities && res.data.activities.length > 0) {
          const live = res.data.activities.map((a: any, idx: number) => {
            const low = (a.action || '').toLowerCase();
            let type = 'task';
            let path = '/tasks';
            if (low.includes('invoice') || low.includes('paid')) {
              type = 'payment';
              path = user?.role !== 'developer' ? '/invoices' : '/dashboard';
            } else if (low.includes('project')) {
              type = 'project';
              path = a.project?._id ? `/projects/${a.project._id}` : '/projects';
            } else if (low.includes('user') || low.includes('role')) {
              type = 'security';
              path = user?.role === 'admin' ? '/users' : '/settings';
            }

            const createdTime = new Date(a.createdAt);
            const diffMin = Math.round((Date.now() - createdTime.getTime()) / 60000);
            const timeStr = diffMin < 60 ? `${Math.max(1, diffMin)}m ago` : diffMin < 1440 ? `${Math.round(diffMin / 60)}h ago` : `${Math.round(diffMin / 1440)}d ago`;

            return {
              id: a._id || idx,
              text: `${a.user?.name || 'System'}: ${a.action}`,
              time: timeStr,
              unread: idx < 2,
              type,
              path
            };
          });
          setNotifications(live);
        }
      } catch (err) {
        // Fallback to role defaults
      }
    };
    fetchLiveNotifications();
  }, [user?.role]);

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
    if (path.includes('/activity')) return 'Activity Audit Log';
    if (path.includes('/users')) return 'User & Role Management';
    if (path.includes('/settings')) return 'Settings';
    return 'ClientFlow';
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const hasAnyResults =
    searchResults.projects.length > 0 ||
    searchResults.tasks.length > 0 ||
    searchResults.invoices.length > 0 ||
    searchResults.users.length > 0;

  return (
    <div className="app">
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <BrandLogo
              size="md"
              subtitle={user?.role === 'admin' ? 'ADMIN ERP' : user?.role === 'client' ? 'CLIENT PORTAL' : 'DEVELOPER STATION'}
            />
          </Link>
          <button
            className="mobile-sidebar-close"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
          {user?.role === 'admin' && (
            <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/clients')}><Users size={18} /> Customers</Link>
          )}
          <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/projects')}><FolderKanban size={18} /> {user?.role === 'client' ? 'My Projects' : 'Projects'}</Link>
          <Link to="/tasks" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/tasks')}><CheckSquare size={18} /> {user?.role === 'client' ? 'My Tasks' : 'Tasks'}</Link>
          {user?.role !== 'developer' && (
            <Link to="/invoices" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/invoices')}><FileText size={18} /> Invoices</Link>
          )}
          <Link to="/calendar" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/calendar')}><CalendarIcon size={18} /> Calendar</Link>
          <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/messages')}><MessageSquare size={18} /> Messages</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/reports')}><BarChart2 size={18} /> Reports</Link>
              <Link to="/activity" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/activity')}><History size={18} /> Audit Log</Link>
              <Link to="/users" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/users')}><ShieldCheck size={18} /> Team & RBAC</Link>
            </>
          )}
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={isActive('/settings')}><SettingsIcon size={18} /> Settings</Link>

          <div style={{ flex: 1 }}></div>

          <button onClick={logout} className="logout-btn mt-auto" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500
          }}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <div className="mobile-brand-mark" style={{ display: 'none', alignItems: 'center' }}>
              <BrandIcon size={26} rotate={false} />
            </div>

            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          <div className="topbar-right">

            {/* Global Omnisearch Container */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div className="search-bar" style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-color)',
                padding: '0.45rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid var(--surface-border)',
                transition: 'all 0.2s ease',
                boxShadow: isSearchOpen ? '0 0 0 2px var(--primary)' : 'none'
              }}>
                <Search size={15} style={{ color: 'var(--text-muted)', marginRight: '0.4rem', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.trim().length >= 2) setIsSearchOpen(true); }}
                  placeholder="Search (Ctrl+K)..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.85rem',
                    width: '100%',
                    minWidth: 0
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Omnisearch Floating Results Popover */}
              {isSearchOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 'min(380px, calc(100vw - 2rem))',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.14)',
                  zIndex: 100,
                  padding: '0.75rem 0',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {isSearching ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      <Clock size={18} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                      <div>Searching ClientFlow database...</div>
                    </div>
                  ) : !hasAnyResults ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No matches found for "{searchQuery}"
                    </div>
                  ) : (
                    <div>
                      {/* Projects Category */}
                      {searchResults.projects.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            PROJECTS
                          </div>
                          {searchResults.projects.map(p => (
                            <div
                              key={p._id}
                              onClick={() => handleSearchResultClick(`/projects/${p._id}`)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 1rem',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, rgba(0,0,0,0.03))'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                                <FolderKanban size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasks Category */}
                      {searchResults.tasks.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            TASKS & DELIVERABLES
                          </div>
                          {searchResults.tasks.map(t => (
                            <div
                              key={t._id}
                              onClick={() => handleSearchResultClick('/tasks')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 1rem',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, rgba(0,0,0,0.03))'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                                <CheckSquare size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {t.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Invoices Category */}
                      {searchResults.invoices.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            INVOICES & SETTLEMENTS
                          </div>
                          {searchResults.invoices.map(inv => (
                            <div
                              key={inv._id}
                              onClick={() => handleSearchResultClick('/invoices')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 1rem',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, rgba(0,0,0,0.03))'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FileText size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {inv.invoiceNumber || 'Invoice'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    ${(inv.amount || 0).toLocaleString()} • {inv.client?.name || 'Client'}
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: inv.status === 'Paid' ? '#10b981' : '#f59e0b',
                                fontWeight: 600
                              }}>
                                {inv.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Users Category (Admin Only) */}
                      {searchResults.users.length > 0 && (
                        <div>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            CLIENTS & TEAM MEMBERS
                          </div>
                          {searchResults.users.map(u => (
                            <div
                              key={u._id}
                              onClick={() => handleSearchResultClick(u.role === 'client' ? '/clients' : '/users')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 1rem',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, rgba(0,0,0,0.03))'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'var(--primary)',
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 600
                                }}>
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    {u.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', textTransform: 'capitalize', fontWeight: 600 }}>
                                {u.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                  top: 'calc(100% + 12px)',
                  width: '320px',
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bell size={16} /> Notifications
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '0.2rem 0.5rem'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if ((n as any).path) navigate((n as any).path);
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                          setIsNotifOpen(false);
                        }}
                        style={{
                          cursor: 'pointer',
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--surface-border)',
                          background: n.unread ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{ marginTop: '0.2rem', color: n.type === 'payment' ? '#10b981' : n.type === 'task' ? 'var(--primary)' : '#f59e0b' }}>
                          {n.type === 'payment' ? <CheckCircle2 size={16} /> : n.type === 'task' ? <Clock size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, fontWeight: n.unread ? 600 : 400 }}>
                            {n.text}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        {n.unread && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.4rem' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }} title="Profile & Avatar Settings">
              <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                <div className="user-info" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span className="user-name" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user?.name || 'User'}
                  </span>
                  <span className="user-role" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize', lineHeight: 1.2 }}>
                    {user?.role}
                  </span>
                </div>
                <UserAvatar avatar={user?.avatar} name={user?.name} size={32} />
              </div>
            </Link>
          </div>
        </header>

        <div className="container">
          <Outlet />
        </div>

        {/* Floating Right-Side Corner Scroll Sticker / Action Pill */}
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
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.45)',
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
