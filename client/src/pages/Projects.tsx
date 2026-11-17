import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, ChevronLeft, ChevronRight, MoreHorizontal, 
  FolderKanban, CheckCircle2, Clock, DollarSign, Download, Eye, 
  Edit3, Trash2, X, AlertCircle, RefreshCw, UserCheck, Calendar, ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface ProjectItem {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  client?: { _id: string; name: string; email: string; company?: string };
  developer?: { _id: string; name: string; email: string };
  budget?: number;
  deadline?: string;
  progress?: number;
  createdAt?: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'developer';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clientsList, setClientsList] = useState<UserOption[]>([]);
  const [developersList, setDevelopersList] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Actions Dropdown & Modals
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'in-progress' as 'pending' | 'in-progress' | 'completed',
    clientId: '',
    developerId: '',
    budget: 0,
    deadline: '',
    progress: 10
  });

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProjectsData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [projRes, usersRes] = await Promise.allSettled([
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: { users: [] } })
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }

      if (usersRes.status === 'fulfilled' && (usersRes.value as any).data.users) {
        const allUsers: UserOption[] = (usersRes.value as any).data.users;
        setClientsList(allUsers.filter(u => u.role === 'client'));
        setDevelopersList(allUsers.filter(u => u.role === 'developer'));
      }

      if (isManual) showToast('Projects synchronized with MongoDB Atlas!');
    } catch (err: any) {
      console.error('Failed to fetch projects', err);
      showToast('Error syncing projects: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.developer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Paginated Projects
  const totalProjects = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Computed KPIs
  const metrics = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    return { total, inProgress, completed, totalBudget };
  }, [projects]);

  // Create Project Action
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.clientId) {
      showToast('Project title and client are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/projects', form);
      if (res.data.success) {
        showToast(`Project "${form.title}" created successfully!`);
        setIsAddModalOpen(false);
        setForm({ title: '', description: '', status: 'in-progress', clientId: '', developerId: '', budget: 0, deadline: '', progress: 10 });
        fetchProjectsData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Project Action
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/projects/${selectedProject._id}`, form);
      if (res.data.success) {
        showToast(`Project "${form.title}" updated successfully!`);
        setIsEditModalOpen(false);
        fetchProjectsData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Project Action
  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove project "${title}"?`)) return;
    try {
      const res = await api.delete(`/projects/${id}`);
      if (res.data.success) {
        showToast(`Project "${title}" removed.`);
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error removing project', 'error');
    }
  };

  const openEdit = (p: ProjectItem) => {
    setSelectedProject(p);
    setForm({
      title: p.title,
      description: p.description || '',
      status: p.status,
      clientId: p.client?._id || '',
      developerId: p.developer?._id || '',
      budget: p.budget || 0,
      deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : '',
      progress: p.progress || (p.status === 'completed' ? 100 : p.status === 'in-progress' ? 50 : 10)
    });
    setOpenActionId(null);
    setIsEditModalOpen(true);
  };

  const openView = (p: ProjectItem) => {
    setSelectedProject(p);
    setOpenActionId(null);
    setIsViewModalOpen(true);
  };

  // CSV Export Action
  const handleExportCSV = () => {
    const csvContent = [
      ['Project Title', 'Client', 'Assigned Developer', 'Status', 'Progress %', 'Budget', 'Created On'],
      ...projects.map(p => [
        `"${p.title}"`,
        `"${p.client?.name || 'Unassigned'}"`,
        `"${p.developer?.name || 'Unassigned'}"`,
        p.status,
        `${p.progress || (p.status === 'completed' ? 100 : 50)}%`,
        `$${p.budget || 0}`,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
      ])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Projects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Project directory exported to CSV!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '2rem',
          zIndex: 100,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '0.85rem 1.5rem',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 500,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="dashboard-banner-header" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
        background: 'var(--surface)',
        padding: '1.5rem 2rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.4px' }}>
              Project Operations & Portfolio
            </h2>
            <span style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px'
            }}>
              ERP PORTFOLIO
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Track client milestones, allocate engineering teams, manage budgets, and monitor real-time completion.
          </p>
        </div>

        <div className="dashboard-action-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            className="dashboard-action-btn"
            onClick={() => fetchProjectsData(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.1rem',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem'
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Sync Atlas'}
          </button>

          <button
            className="dashboard-action-btn"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.1rem',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            <Download size={16} /> Export CSV
          </button>

          {isAdmin && (
            <button
              className="dashboard-action-btn"
              onClick={() => {
                setForm({ title: '', description: '', status: 'in-progress', clientId: '', developerId: '', budget: 0, deadline: '', progress: 10 });
                setIsAddModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards (4 Stat Cards in ONE ROW) */}
      <div className="stats-grid dashboard-stats-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { title: 'Total Portfolio', value: loading ? '...' : metrics.total, desc: 'Registered in database', icon: FolderKanban, color: '#3b82f6' },
          { title: 'Active Milestones', value: loading ? '...' : metrics.inProgress, desc: 'Currently in progress', icon: Clock, color: '#f59e0b' },
          { title: 'Delivered Projects', value: loading ? '...' : metrics.completed, desc: 'Successfully completed', icon: CheckCircle2, color: '#10b981' },
          { title: 'Allocated Budget', value: loading ? '...' : `$${metrics.totalBudget.toLocaleString()}`, desc: 'Total contract value', icon: DollarSign, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '1.2rem 1.1rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{stat.title}</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{stat.desc}</span>
            </div>
            <div style={{ background: `${stat.color}18`, color: stat.color, padding: '0.65rem', borderRadius: '12px', flexShrink: 0, marginLeft: '0.5rem' }}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Project Table & Filters */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        
        {/* Table Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-color)',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            padding: '0.55rem 0.9rem',
            width: '280px'
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search by project, client, developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.88rem',
                width: '100%'
              }}
            />
            {searchTerm && (
              <X size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} /> Status:
            </span>
            {(['all', 'in-progress', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  border: statusFilter === status ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                  background: statusFilter === status ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-color)',
                  color: statusFilter === status ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {status === 'all' ? 'All' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.01)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Project Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Client Account</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Assigned Lead</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Progress & Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    Loading projects from MongoDB Atlas...
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    No projects found matching current criteria.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  const initial = p.title.charAt(0).toUpperCase();
                  const isActionOpen = openActionId === p._id;
                  const progressVal = p.progress || (p.status === 'completed' ? 100 : p.status === 'in-progress' ? 50 : 15);

                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: p.status === 'completed' 
                              ? 'linear-gradient(135deg, #10b981, #059669)' 
                              : 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: '#ffffff',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem'
                          }}>
                            {initial}
                          </div>
                          <div>
                            <Link to={`/projects/${p._id}`} style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem', textDecoration: 'none' }}>
                              {p.title}
                            </Link>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {p.description ? p.description.substring(0, 40) + '...' : 'Milestone deliverable'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.client?.name || 'Unassigned'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.client?.email || ''}</div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <UserCheck size={15} style={{ color: p.developer ? '#10b981' : 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 500, color: p.developer ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {p.developer?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '130px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                            <span style={{
                              textTransform: 'capitalize',
                              color: p.status === 'completed' ? '#10b981' : p.status === 'in-progress' ? '#3b82f6' : '#f59e0b'
                            }}>
                              {p.status}
                            </span>
                            <span>{progressVal}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progressVal}%`,
                              height: '100%',
                              borderRadius: '10px',
                              background: p.status === 'completed' ? '#10b981' : p.status === 'in-progress' ? 'var(--primary)' : '#f59e0b'
                            }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                        <button
                          onClick={() => setOpenActionId(isActionOpen ? null : p._id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--surface-border)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.35rem 0.55rem',
                            borderRadius: '6px'
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {isActionOpen && (
                          <div style={{
                            position: 'absolute',
                            right: '1.5rem',
                            top: '3.2rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            zIndex: 30,
                            width: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            animation: 'fadeIn 0.15s ease-out'
                          }}>
                            <Link
                              to={`/projects/${p._id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.65rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                fontSize: '0.85rem',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 600
                              }}
                            >
                              <FolderKanban size={15} style={{ color: 'var(--primary)' }} /> 360° Portal
                            </Link>

                            <button
                              onClick={() => openView(p)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.65rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                fontSize: '0.85rem',
                                color: 'var(--text-main)',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={15} style={{ color: 'var(--text-muted)' }} /> Quick Drawer
                            </button>

                            {(isAdmin || isDeveloper) && (
                              <button
                                onClick={() => openEdit(p)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  padding: '0.65rem 1rem',
                                  background: 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-main)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit3 size={15} style={{ color: '#f59e0b' }} /> Edit Progress
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleDeleteProject(p._id, p.title);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  padding: '0.65rem 1rem',
                                  background: 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  fontSize: '0.85rem',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  borderTop: '1px solid var(--surface-border)'
                                }}
                              >
                                <Trash2 size={15} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Real Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--surface-border)',
          background: 'rgba(0,0,0,0.01)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Showing {totalProjects === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalProjects)} of {totalProjects} projects
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: '1px solid var(--surface-border)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: num === currentPage ? 'none' : '1px solid var(--surface-border)',
                  background: num === currentPage ? 'var(--primary)' : 'var(--bg-color)',
                  color: num === currentPage ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                border: '1px solid var(--surface-border)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL: Add Project
          ========================================= */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)', width: '100%', maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Initialize Enterprise Project</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Project Title *</label>
                <input
                  type="text" required placeholder="e.g. AI Workflow Engine"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Assigned Client *</label>
                  <select
                    required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="">Select client...</option>
                    {clientsList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Lead Developer</label>
                  <select
                    value={form.developerId} onChange={e => setForm({ ...form, developerId: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="">Select developer...</option>
                    {developersList.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Contract Budget ($)</label>
                  <input
                    type="number" placeholder="5000"
                    value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Status</label>
                  <select
                    value={form.status} onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="pending">Planning (Pending)</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Description & Scope</label>
                <textarea
                  rows={3} placeholder="Deliverable requirements and milestones..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button" onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '0.7rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: Edit Project
          ========================================= */}
      {isEditModalOpen && selectedProject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)', width: '100%', maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Update Project Progress</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProject}>
              {isAdmin && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Title</label>
                  <input
                    type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Status</label>
                  <select
                    value={form.status} onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="pending">Planning (Pending)</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Progress ({form.progress}%)</label>
                  <input
                    type="range" min="0" max="100" value={form.progress}
                    onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                    style={{ width: '100%', marginTop: '0.65rem' }}
                  />
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Developer</label>
                    <select
                      value={form.developerId} onChange={e => setForm({ ...form, developerId: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="">Select developer...</option>
                      {developersList.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Budget ($)</label>
                    <input
                      type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.5rem' }}>
                <button
                  type="button" onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '0.7rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DRAWER: Project 360 View
          ========================================= */}
      {isViewModalOpen && selectedProject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)', width: '100%', maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{selectedProject.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Client: {selectedProject.client?.name || 'Unassigned'}
                </span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status</span>
                <div style={{ fontWeight: 600, textTransform: 'capitalize', color: selectedProject.status === 'completed' ? '#10b981' : 'var(--primary)' }}>
                  {selectedProject.status}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
                <div style={{ fontWeight: 600 }}>{selectedProject.progress || 50}% Completed</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lead Developer</span>
                <div style={{ fontWeight: 600 }}>{selectedProject.developer?.name || 'Unassigned'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Budget</span>
                <div style={{ fontWeight: 600 }}>${(selectedProject.budget || 0).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Scope & Requirements</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {selectedProject.description || 'No detailed description provided for this project.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEdit(selectedProject);
                }}
                style={{ padding: '0.7rem 1.25rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                Edit Progress
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
