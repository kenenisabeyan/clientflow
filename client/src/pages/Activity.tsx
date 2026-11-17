import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  History, Search, Filter, Download, RefreshCw, FolderKanban, 
  CheckSquare, FileText, ShieldCheck, UserCheck, Clock, CheckCircle2,
  Calendar, Layers, ArrowUpRight
} from 'lucide-react';

interface ActivityItem {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  };
  project?: {
    _id: string;
    title: string;
    status?: string;
  };
  action: string;
  details?: any;
  createdAt: string;
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Projects' | 'Tasks' | 'Invoices' | 'Security'>('All');

  const fetchActivities = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/activity?limit=100');
      if (res.data.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Error fetching activity audit logs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter & Search
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (a.user?.name || '').toLowerCase().includes(search) ||
        (a.user?.email || '').toLowerCase().includes(search) ||
        (a.action || '').toLowerCase().includes(search) ||
        (a.project?.title || '').toLowerCase().includes(search);

      if (!matchesSearch) return false;

      if (filterCategory === 'Projects') {
        return (a.action || '').toLowerCase().includes('project');
      } else if (filterCategory === 'Tasks') {
        return (a.action || '').toLowerCase().includes('task');
      } else if (filterCategory === 'Invoices') {
        return (a.action || '').toLowerCase().includes('invoice') || (a.action || '').toLowerCase().includes('paid');
      } else if (filterCategory === 'Security') {
        return (a.action || '').toLowerCase().includes('user') || (a.action || '').toLowerCase().includes('role');
      }
      return true;
    });
  }, [activities, searchTerm, filterCategory]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = activities.length;
    const projectOps = activities.filter(a => (a.action || '').toLowerCase().includes('project')).length;
    const taskOps = activities.filter(a => (a.action || '').toLowerCase().includes('task')).length;
    const financialOps = activities.filter(a => (a.action || '').toLowerCase().includes('invoice') || (a.action || '').toLowerCase().includes('paid')).length;
    return { total, projectOps, taskOps, financialOps };
  }, [activities]);

  // CSV Export
  const exportAuditCSV = () => {
    if (!activities.length) return;
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Project Associated'];
    const rows = activities.map(a => [
      `"${new Date(a.createdAt).toISOString()}"`,
      `"${a.user?.name || 'System'}"`,
      `"${a.user?.role || 'system'}"`,
      `"${a.action.replace(/"/g, '""')}"`,
      `"${a.project?.title || 'Global'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ClientFlow_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionIcon = (action: string) => {
    const low = action.toLowerCase();
    if (low.includes('project')) return <FolderKanban size={18} style={{ color: 'var(--primary)' }} />;
    if (low.includes('task')) return <CheckSquare size={18} style={{ color: '#10b981' }} />;
    if (low.includes('invoice') || low.includes('paid')) return <FileText size={18} style={{ color: '#f59e0b' }} />;
    if (low.includes('user') || low.includes('role')) return <ShieldCheck size={18} style={{ color: '#8b5cf6' }} />;
    return <History size={18} style={{ color: 'var(--text-muted)' }} />;
  };

  const getRoleBadge = (role?: string) => {
    const r = (role || 'admin').toLowerCase();
    let bg = 'rgba(99, 102, 241, 0.1)';
    let color = 'var(--primary)';
    if (r === 'client') {
      bg = 'rgba(59, 130, 246, 0.1)';
      color = '#3b82f6';
    } else if (r === 'developer') {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#10b981';
    }
    return (
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        background: bg,
        color: color
      }}>
        {r}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="dashboard-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={26} style={{ color: 'var(--primary)' }} /> Activity Audit Trail
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Permanent chronological record of role operations, project milestones, and ERP state transitions.
          </p>
        </div>

        <div className="dashboard-action-controls" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="dashboard-action-btn"
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Sync Atlas
          </button>

          <button
            className="dashboard-action-btn"
            onClick={exportAuditCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* 4 Stat Cards in ONE ROW */}
      <div className="stats-grid dashboard-stats-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Audit Events</h3>
          <p style={{ fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.total}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Recorded in MongoDB Atlas</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project Updates</h3>
          <p style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.projectOps}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Scope & spec revisions</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Task Transitions</h3>
          <p style={{ color: '#10b981', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.taskOps}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Kanban & sprint moves</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Financial Actions</h3>
          <p style={{ color: '#f59e0b', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.financialOps}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Invoices created & paid</span>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-color)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          width: '320px',
          maxWidth: '100%'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search by actor, action, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['All', 'Projects', 'Tasks', 'Invoices', 'Security'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterCategory === cat ? 'var(--primary)' : 'var(--surface-border)',
                background: filterCategory === cat ? 'var(--primary)' : 'transparent',
                color: filterCategory === cat ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Table / Cards */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Showing {filteredActivities.length} Audit Events
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time synchronization
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
            <div>Loading activity history...</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <History size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
              No audit logs matched your query
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Try clearing filters or search keywords.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredActivities.map((item, index) => (
              <div
                key={item._id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: index < filteredActivities.length - 1 ? '1px solid var(--surface-border)' : 'none',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getActionIcon(item.action)}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {item.user?.name || 'System Operator'}
                      </span>
                      {getRoleBadge(item.user?.role)}
                      {item.project && (
                        <Link
                          to={`/projects/${item.project._id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.78rem',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            padding: '0.15rem 0.45rem',
                            background: 'rgba(99, 102, 241, 0.08)',
                            borderRadius: '4px'
                          }}
                        >
                          <FolderKanban size={12} /> {item.project.title} <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                      {item.action}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <Clock size={13} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
