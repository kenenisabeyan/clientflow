import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, 
  AlertCircle, Calendar, User as UserIcon, ArrowRight, Trash2, 
  Edit3, LayoutGrid, List, Download, RefreshCw, X, ChevronDown,
  Briefcase, CheckSquare, Sparkles, FolderKanban
} from 'lucide-react';

interface TaskItem {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  project: string;
  projectId?: any;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'inProgress' | 'done';
  date: string;
  avatar?: string;
  createdAt?: string;
}

interface ProjectOption {
  _id: string;
  title: string;
  status: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDev = user?.role === 'developer';
  const isClient = user?.role === 'client';

  // Data State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // View Mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'inProgress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'todo' as 'todo' | 'inProgress' | 'done',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch tasks, projects, users
  const fetchTasksData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [taskRes, projRes, userRes] = await Promise.allSettled([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users')
      ]);

      if (taskRes.status === 'fulfilled' && taskRes.value.data) {
        const d = taskRes.value.data;
        const all: TaskItem[] = [];
        if (Array.isArray(d.tasks)) {
          all.push(...d.tasks);
        } else {
          if (d.todo) d.todo.forEach((t: any) => all.push({ ...t, status: 'todo' }));
          if (d.inProgress) d.inProgress.forEach((t: any) => all.push({ ...t, status: 'inProgress' }));
          if (d.done) d.done.forEach((t: any) => all.push({ ...t, status: 'done' }));
        }
        setTasks(all);
      }

      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }

      if (userRes.status === 'fulfilled' && userRes.value.data.users) {
        setUsers(userRes.value.data.users);
      }

      if (isManual) showToast('Tasks updated live from MongoDB Atlas!');
    } catch (err: any) {
      console.error('Failed to fetch tasks', err);
      if (isManual) showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  // Update Status directly (Kanban drag or click)
  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t));
      
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task moved to ${newStatus === 'inProgress' ? 'In Progress' : newStatus === 'done' ? 'Completed' : 'To Do'}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('Failed to update task status: ' + err.message, 'error');
      fetchTasksData();
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project.trim()) {
      showToast('Please provide a title and select a project', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        project: formData.project,
        projectId: formData.projectId || null,
        assignedTo: formData.assignedTo || null,
        priority: formData.priority,
        status: formData.status,
        date: formData.date
      };

      const res = await api.post('/tasks', payload);
      const created = res.data.task || res.data;
      setTasks(prev => [created, ...prev]);
      
      showToast('Task created successfully in MongoDB Atlas!');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        project: projects[0]?.title || '',
        projectId: projects[0]?._id || '',
        assignedTo: '',
        priority: 'Medium',
        status: 'todo',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    } catch (err: any) {
      console.error('Create task error:', err);
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks(prev => prev.filter(t => t._id !== taskId && t.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
      showToast('Task removed successfully');
      if (detailTask?._id === taskId) setDetailTask(null);
    } catch (err: any) {
      console.error('Delete task error:', err);
      showToast('Failed to delete task', 'error');
      fetchTasksData();
    }
  };

  // Export Tasks to CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No tasks available to export', 'error');
      return;
    }
    const headers = ['Task Title,Project,Priority,Status,Due Date,Assignee'];
    const rows = filteredTasks.map(t => {
      const assignee = t.assignedTo?.name || 'Unassigned';
      return `"${t.title.replace(/"/g, '""')}","${(t.project || '').replace(/"/g, '""')}","${t.priority}","${t.status}","${t.date}","${assignee}"`;
    });
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tasks exported to CSV!');
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.project && t.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchProject = projectFilter === 'all' || t.project === projectFilter || (t.projectId && (t.projectId._id === projectFilter || t.projectId === projectFilter));

      return matchSearch && matchStatus && matchPriority && matchProject;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter]);

  // Derived KPI Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, todo, inProgress, done, completionRate };
  }, [tasks]);

  // Column grouping for Kanban
  const kanbanColumns = useMemo(() => {
    return {
      todo: filteredTasks.filter(t => t.status === 'todo'),
      inProgress: filteredTasks.filter(t => t.status === 'inProgress'),
      done: filteredTasks.filter(t => t.status === 'done'),
    };
  }, [filteredTasks]);

  // Helpers
  const getPriorityBadge = (priority: string) => {
    const isHigh = priority === 'High';
    const isMedium = priority === 'Medium';
    const color = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#3b82f6';
    const bg = isHigh ? 'rgba(239, 68, 68, 0.1)' : isMedium ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    return (
      <span style={{ 
        color, 
        backgroundColor: bg, 
        padding: '0.2rem 0.55rem', 
        borderRadius: '6px', 
        fontSize: '0.75rem', 
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></span>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'done') {
      return (
        <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    }
    if (status === 'inProgress') {
      return (
        <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} /> In Progress
        </span>
      );
    }
    return (
      <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <AlertCircle size={12} /> To Do
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '2rem',
          zIndex: 100,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 500,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
              {isDev ? 'Developer Sprint Tasks' : isClient ? 'Project Deliverables' : 'Task & Sprint Management'}
            </h2>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '20px', 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: 'var(--primary)' 
            }}>
              {metrics.total} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {isDev ? 'Track and manage your sprint velocity and assigned engineering tasks.' : isClient ? 'Review status of deliverables and milestones across your contracted projects.' : 'Manage task assignments, sprint backlog, and engineering deliverables across all client portfolios.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--surface)', 
            border: '1px solid var(--surface-border)', 
            borderRadius: '8px', 
            padding: '3px' 
          }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'kanban' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={15} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <List size={15} /> List
            </button>
          </div>

          <button
            onClick={() => fetchTasksData(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <Download size={14} /> Export CSV
          </button>

          {!isClient && (
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  project: projects[0]?.title || '',
                  projectId: projects[0]?._id || '',
                  assignedTo: '',
                  priority: 'Medium',
                  status: 'todo',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                });
                setIsCreateModalOpen(true);
              }}
              className="btn-primary"
              style={{
                marginTop: 0,
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards (4 Stat Cards in ONE ROW) */}
      <div className="stats-grid dashboard-stats-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Total Tasks */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.15rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckSquare size={20} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Total Tasks</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{metrics.total}</h3>
          </div>
        </div>

        {/* To Do */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.15rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Backlog / To Do</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{metrics.todo}</h3>
          </div>
        </div>

        {/* In Progress */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.15rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={20} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>In Progress</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{metrics.inProgress}</h3>
          </div>
        </div>

        {/* Completed */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.15rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Completed</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>{metrics.completionRate}%</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{metrics.done}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-color)',
          border: '1px solid var(--surface-border)',
          borderRadius: '8px',
          padding: '0.55rem 0.9rem',
          width: '320px',
          maxWidth: '100%'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search tasks, project, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
          {searchQuery && (
            <X size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Status: All</option>
            <option value="todo">To Do</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e: any) => setPriorityFilter(e.target.value)}
            style={{
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Priority: All</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Project Filter */}
          {projects.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{
                background: 'var(--bg-color)',
                color: 'var(--text-main)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '200px'
              }}
            >
              <option value="all">Project: All</option>
              {projects.map(p => (
                <option key={p._id} value={p.title}>{p.title}</option>
              ))}
            </select>
          )}

          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span>Loading tasks from live database...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <CheckSquare size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>No tasks found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: 0, fontSize: '0.9rem' }}>
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try modifying your search or filter criteria to see matching tasks.' 
              : 'There are currently no tasks in your sprint. Create your first task to start tracking velocity.'}
          </p>
          {!isClient && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
              style={{ width: 'auto', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> Create Task
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="kanban-board-grid" style={{ alignItems: 'flex-start' }}>
          {/* TO DO COLUMN */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Column Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>To Do</span>
              </div>
              <span style={{
                background: 'var(--surface-border)',
                color: 'var(--text-main)',
                padding: '0.15rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {kanbanColumns.todo.length}
              </span>
            </div>

            {/* Task Cards */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '280px' }}>
              {kanbanColumns.todo.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  No tasks to do
                </div>
              ) : (
                kanbanColumns.todo.map(t => (
                  <div
                    key={t._id || t.id}
                    style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setDetailTask(t)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {t.project}
                      </span>
                      {getPriorityBadge(t.priority)}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {t.title}
                    </h4>

                    {t.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {t.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {t.date}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(t._id || t.id!, 'inProgress');
                        }}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: 'none',
                          color: 'var(--primary)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        Start <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(59, 130, 246, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>In Progress</span>
              </div>
              <span style={{
                background: 'var(--surface-border)',
                color: 'var(--text-main)',
                padding: '0.15rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {kanbanColumns.inProgress.length}
              </span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '280px' }}>
              {kanbanColumns.inProgress.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  No tasks in progress
                </div>
              ) : (
                kanbanColumns.inProgress.map(t => (
                  <div
                    key={t._id || t.id}
                    style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setDetailTask(t)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {t.project}
                      </span>
                      {getPriorityBadge(t.priority)}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {t.title}
                    </h4>

                    {t.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {t.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {t.date}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(t._id || t.id!, 'todo');
                          }}
                          style={{
                            background: 'var(--surface-border)',
                            border: 'none',
                            color: 'var(--text-muted)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Back
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(t._id || t.id!, 'done');
                          }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: 'none',
                            color: '#10b981',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          Done <CheckCircle2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 185, 129, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Completed</span>
              </div>
              <span style={{
                background: 'var(--surface-border)',
                color: 'var(--text-main)',
                padding: '0.15rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {kanbanColumns.done.length}
              </span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '280px' }}>
              {kanbanColumns.done.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  No completed tasks yet
                </div>
              ) : (
                kanbanColumns.done.map(t => (
                  <div
                    key={t._id || t.id}
                    style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      opacity: 0.85,
                      cursor: 'pointer'
                    }}
                    onClick={() => setDetailTask(t)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-border)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {t.project}
                      </span>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', textDecoration: 'line-through' }}>
                      {t.title}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {t.date}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(t._id || t.id!, 'inProgress');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Task</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Project</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr
                  key={t._id || t.id}
                  style={{
                    borderBottom: '1px solid var(--surface-border)',
                    transition: 'background 0.15s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDetailTask(t)}
                >
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '0px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {t.avatar || t.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{t.title}</div>
                        {t.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {t.description.length > 50 ? t.description.slice(0, 50) + '...' : t.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {t.project}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {getPriorityBadge(t.priority)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {getStatusBadge(t.status)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {t.date}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {/* Status Dropdown Quick Selector */}
                      <select
                        value={t.status}
                        onChange={(e: any) => handleUpdateStatus(t._id || t.id!, e.target.value)}
                        style={{
                          background: 'var(--bg-color)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--surface-border)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.75rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>

                      {!isClient && (
                        <button
                          onClick={() => handleDeleteTask(t._id || t.id!)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.3rem',
                            borderRadius: '4px'
                          }}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer */}
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--surface-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <span>Showing {filteredTasks.length} of {tasks.length} total tasks</span>
            <span>ClientFlow Engineering Sprint</span>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            animation: 'scaleUp 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Create New Task</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Assign deliverable to client project and engineering sprint</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Stripe webhook listener"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Project Assignment *</label>
                {projects.length > 0 ? (
                  <select
                    required
                    value={formData.project}
                    onChange={(e) => {
                      const sel = projects.find(p => p.title === e.target.value);
                      setFormData({
                        ...formData,
                        project: e.target.value,
                        projectId: sel ? sel._id : ''
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Project Name"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Nov 25, 2026"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Technical specs, acceptance criteria, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    width: 'auto',
                    marginTop: 0,
                    padding: '0.65rem 1.5rem',
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK DETAIL DRAWER */}
      {detailTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setDetailTask(null)}
        >
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--surface)',
            height: '100%',
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                {detailTask.project}
              </span>
              <button
                onClick={() => setDetailTask(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-main)' }}>
                {detailTask.title}
              </h3>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {getPriorityBadge(detailTask.priority)}
                {getStatusBadge(detailTask.status)}
              </div>
            </div>

            {/* Quick Status Advance */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Update Sprint Status:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleUpdateStatus(detailTask._id || detailTask.id!, 'todo')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--surface-border)',
                    background: detailTask.status === 'todo' ? 'var(--primary)' : 'transparent',
                    color: detailTask.status === 'todo' ? '#fff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  To Do
                </button>
                <button
                  onClick={() => handleUpdateStatus(detailTask._id || detailTask.id!, 'inProgress')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--surface-border)',
                    background: detailTask.status === 'inProgress' ? '#3b82f6' : 'transparent',
                    color: detailTask.status === 'inProgress' ? '#fff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(detailTask._id || detailTask.id!, 'done')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--surface-border)',
                    background: detailTask.status === 'done' ? '#10b981' : 'transparent',
                    color: detailTask.status === 'done' ? '#fff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Description & Scope</span>
              <div style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                minHeight: '80px'
              }}>
                {detailTask.description || 'No detailed specifications added for this task yet.'}
              </div>
            </div>

            {/* Meta Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Due Date:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{detailTask.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Assigned Project:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{detailTask.project}</span>
              </div>
            </div>

            {!isClient && (
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                <button
                  onClick={() => handleDeleteTask(detailTask._id || detailTask.id!)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Trash2 size={16} /> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
