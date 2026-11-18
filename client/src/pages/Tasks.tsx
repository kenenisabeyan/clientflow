// Tasks.tsx – optimized with React Query and optional virtualization
import React, { useState, useMemo } from 'react';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User as UserIcon,
  ArrowRight,
  Trash2,
  Edit3,
  LayoutGrid,
  List as ListIcon,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  Briefcase,
  CheckSquare,
  FolderKanban,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

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

  const queryClient = useQueryClient();

  // React Query fetches
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery(['tasks', isAdmin], async () => {
    const [taskRes, projRes, userRes] = await Promise.allSettled([
      api.get('/tasks'),
      api.get('/projects'),
      api.get('/users'),
    ]);
    // Build unified task list
    const all: TaskItem[] = [];
    if (taskRes.status === 'fulfilled' && taskRes.value.data) {
      const d = taskRes.value.data;
      if (Array.isArray(d.tasks)) {
        all.push(...d.tasks);
      } else {
        if (d.todo) d.todo.forEach((t: any) => all.push({ ...t, status: 'todo' }));
        if (d.inProgress) d.inProgress.forEach((t: any) => all.push({ ...t, status: 'inProgress' }));
        if (d.done) d.done.forEach((t: any) => all.push({ ...t, status: 'done' }));
      }
    }
    // Projects & users are stored globally for later UI use
    if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
      queryClient.setQueryData(['projects'], projRes.value.data.projects);
    }
    if (userRes.status === 'fulfilled' && userRes.value.data.users) {
      queryClient.setQueryData(['users'], userRes.value.data.users);
    }
    return all as TaskItem[];
  }, { staleTime: 5 * 60 * 1000, refetchInterval: 60000, refetchIntervalInBackground: true });
    const [taskRes, projRes, userRes] = await Promise.allSettled([
      api.get('/tasks'),
      api.get('/projects'),
      api.get('/users'),
    ]);
    // Build unified task list
    const all: TaskItem[] = [];
    if (taskRes.status === 'fulfilled' && taskRes.value.data) {
      const d = taskRes.value.data;
      if (Array.isArray(d.tasks)) {
        all.push(...d.tasks);
      } else {
        if (d.todo) d.todo.forEach((t: any) => all.push({ ...t, status: 'todo' }));
        if (d.inProgress) d.inProgress.forEach((t: any) => all.push({ ...t, status: 'inProgress' }));
        if (d.done) d.done.forEach((t: any) => all.push({ ...t, status: 'done' }));
      }
    }
    // Projects & users are stored globally for later UI use
    if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
      queryClient.setQueryData(['projects'], projRes.value.data.projects);
    }
    if (userRes.status === 'fulfilled' && userRes.value.data.users) {
      queryClient.setQueryData(['users'], userRes.value.data.users);
    }
    return all as TaskItem[];
  }, { staleTime: 5 * 60 * 1000 });

  const { data: projectsData } = useQuery(['projects'], async () => {
    const res = await api.get('/projects');
    return res.data.projects as ProjectOption[];
  }, { enabled: false, staleTime: 5 * 60 * 1000 }); // pre‑filled by tasks query above

  const { data: usersData } = useQuery(['users'], async () => {
    const res = await api.get('/users');
    return res.data.users as UserOption[];
  }, { enabled: false, staleTime: 5 * 60 * 1000 });

  const tasks = tasksData || [];
  const projects = projectsData || [];
  const users = usersData || [];
  const loading = tasksLoading;

  // UI state (unchanged)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'inProgress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Refresh button – manual sync
  const handleRefresh = async () => {
    await refetchTasks();
    queryClient.invalidateQueries(['projects']);
    queryClient.invalidateQueries(['users']);
    setCurrentPage(1); // reset pagination on refresh
    showToast('Tasks synchronized with MongoDB Atlas!');
    await refetchTasks();
    queryClient.invalidateQueries(['projects']);
    queryClient.invalidateQueries(['users']);
    showToast('Tasks synchronized with MongoDB Atlas!');
  };

  // Filtering & pagination (table view)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.project && t.project.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || t.projectId === projectFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter]);

  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalTasks = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, projectFilter]);

  // Update status (optimistic)
  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    try {
      // Optimistic UI
      queryClient.setQueryData(['tasks'], (old: TaskItem[] | undefined) =>
        old?.map((t) => (t._id === taskId || t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task moved to ${newStatus === 'inProgress' ? 'In Progress' : newStatus === 'done' ? 'Completed' : 'To Do'}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('Failed to update task status: ' + err.message, 'error');
      refetchTasks();
    }
  };

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project.trim()) {
      showToast('Please provide a title and select a project', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData };
      const res = await api.post('/tasks', payload);
      const created = res.data.task || res.data;
      queryClient.setQueryData(['tasks'], (old: TaskItem[] | undefined) => [created, ...(old || [])]);
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    } catch (err: any) {
      console.error('Create task error:', err);
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task \"${title}\"?`)) return;
    try {
      queryClient.setQueryData(['tasks'], (old: TaskItem[] | undefined) => old?.filter((t) => t._id !== taskId && t.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
      showToast(`Task \"${title}\" removed.`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting task', 'error');
    }
  };

  // Form handling
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'todo' as 'todo' | 'inProgress' | 'done',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  // Row renderer for table virtualization
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const t = paginatedTasks[index];
    const isActionOpen = openActionId === t._id;
    const progressVal = t.progress || (t.status === 'done' ? 100 : t.status === 'inProgress' ? 50 : 15);
    return (
      <tr key={t._id} style={style}>
        <td style={{ padding: '1.15rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <UserAvatar name={t.title} size={40} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{t.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description?.substring(0, 40)}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-main)' }}>
          {t.project}
        </td>
        <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserAvatar avatar={t.assignedTo?.avatar} name={t.assignedTo?.name || 'Unassigned'} size={26} />
            <span style={{ fontWeight: 500, color: t.assignedTo ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {t.assignedTo?.name || 'Unassigned'}
            </span>
          </div>
        </td>
        <td style={{ padding: '1.15rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
              <span
                style={{
                  textTransform: 'capitalize',
                  color: t.status === 'done' ? '#10b981' : t.status === 'inProgress' ? '#3b82f6' : '#f59e0b',
                }}
              >
                {t.status}
              </span>
              <span>{progressVal}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressVal}%`,
                  height: '100%',
                  borderRadius: '10px',
                  background: t.status === 'done' ? '#10b981' : t.status === 'inProgress' ? 'var(--primary)' : '#f59e0b',
                }}
              />
            </div>
          </div>
        </td>
        <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', position: 'relative' }}>
          <button
            onClick={() => setOpenActionId(isActionOpen ? null : t._id)}
            style={{
              background: 'transparent',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem 0.55rem',
              borderRadius: '6px',
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {isActionOpen && (
            <div
              style={{
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
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <button
                onClick={() => setDetailTask(t)}
                style={actionBtnStyle('#3b82f6')}
              >
                <Edit3 size={15} style={{ color: '#3b82f6' }} /> Edit Task
              </button>
              <button
                onClick={() => handleUpdateStatus(t._id || t.id || '', t.status === 'todo' ? 'inProgress' : t.status === 'inProgress' ? 'done' : 'todo')}
                style={actionBtnStyle('#10b981')}
              >
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Toggle Status
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteTask(t._id || t.id || '', t.title)}
                  style={actionBtnStyle('#ef4444')}
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  };

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const actionBtnStyle = (color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.65rem 1rem',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '0.85rem',
    color, // dynamic text color
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '85px',
            right: '2rem',
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header with Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Task Board</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-color)',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Syncing...' : 'Sync Atlas'}
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.5rem 0.9rem' }}>
          <Search size={16} style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)' }}
          />
          {searchQuery && <X size={14} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />}
        </div>
        {/* Status filter */}
        <div>
          {(['all', 'todo', 'inProgress', 'done'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.35rem 0.8rem',
                marginRight: '0.4rem',
                borderRadius: '20px',
                border: statusFilter === s ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                background: statusFilter === s ? 'rgba(59,130,246,0.12)' : 'var(--bg-color)',
                color: statusFilter === s ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Priority filter */}
        <div>
          {(['all', 'Low', 'Medium', 'High'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                padding: '0.35rem 0.8rem',
                marginRight: '0.4rem',
                borderRadius: '20px',
                border: priorityFilter === p ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                background: priorityFilter === p ? 'rgba(59,130,246,0.12)' : 'var(--bg-color)',
                color: priorityFilter === p ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
        {/* Project filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table / Kanban view – for brevity we only render table here */}
      {viewMode === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Project</th>
                <th style={{ padding: '1rem' }}>Assignee</th>
                <th style={{ padding: '1rem' }}>Progress</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading tasks from MongoDB Atlas...
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No tasks match the current filters.
                  </td>
                </tr>
              ) : (
                <List height={400} itemCount={paginatedTasks.length} itemSize={100} width="100%">
                  {Row}
                </List>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <div>
          Showing {totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks}
        </div>
        <div>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              style={paginationBtnStyle(num === currentPage, num === currentPage)}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function paginationBtnStyle(disabled: boolean, active?: boolean) {
  return {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: active ? 'none' : '1px solid var(--surface-border)',
    background: active ? 'var(--primary)' : 'var(--bg-color)',
    color: active ? '#fff' : 'var(--text-main)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    margin: '0 2px',
    fontSize: '0.85rem',
    fontWeight: 600,
  } as React.CSSProperties;
}
