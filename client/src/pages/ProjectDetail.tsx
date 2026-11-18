import React, { useState, useEffect } from 'react';
import UserAvatar from '../components/UserAvatar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  ArrowLeft, FolderKanban, CheckCircle2, Clock, AlertCircle, 
  Calendar, DollarSign, User, ShieldCheck, Plus, Send, 
  Download, Edit3, Trash2, MessageSquare, CheckSquare, 
  Activity as ActivityIcon, RefreshCw, X, ChevronRight
} from 'lucide-react';

interface ProjectData {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  budget?: number;
  deadline?: string;
  client?: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
  } | null;
  developer?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskItem {
  _id?: string;
  id?: string;
  title: string;
  project: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'inProgress' | 'done';
  date: string;
  description?: string;
}

interface CommentItem {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ActivityItem {
  _id: string;
  action: string;
  user?: { name: string };
  details?: any;
  createdAt: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDev = user?.role === 'developer';
  const isClient = user?.role === 'client';

  // Data states
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'discussion' | 'audit'>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'todo' as 'todo' | 'inProgress' | 'done',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProjectData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [projRes, tasksRes, commRes, actRes] = await Promise.allSettled([
        api.get(`/projects/${id}`),
        api.get('/tasks'),
        api.get(`/comments/${id}`),
        api.get(`/activity?projectId=${id}`)
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.project) {
        setProject(projRes.value.data.project);
      } else {
        showToast('Project not found or access restricted', 'error');
        navigate('/projects');
        return;
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
        const d = tasksRes.value.data;
        const allTasks: TaskItem[] = Array.isArray(d.tasks) ? d.tasks : [...(d.todo || []), ...(d.inProgress || []), ...(d.done || [])];
        // Filter tasks that belong to this project
        const projectTasks = allTasks.filter(t => 
          t.project === projRes.value.data.project.title || 
          (t as any).projectId === id || 
          (t as any).projectId?._id === id
        );
        setTasks(projectTasks);
      }

      if (commRes.status === 'fulfilled' && commRes.value.data.comments) {
        setComments(commRes.value.data.comments);
      }

      if (actRes.status === 'fulfilled' && actRes.value.data.activities) {
        setActivities(actRes.value.data.activities);
      }

      if (isManual) showToast('Project details synced live with MongoDB Atlas!');
    } catch (err: any) {
      console.error('Error loading project detail:', err);
      showToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) loadProjectData();
  }, [id]);

  // Update Project Status
  const handleUpdateStatus = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      await api.put(`/projects/${id}`, { status: newStatus });
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      showToast(`Project status updated to ${newStatus}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Update Progress
  const handleUpdateProgress = async (newProgress: number) => {
    try {
      await api.put(`/projects/${id}`, { progress: newProgress });
      setProject(prev => prev ? { ...prev, progress: newProgress } : null);
      showToast(`Progress adjusted to ${newProgress}%`);
    } catch (err: any) {
      showToast('Failed to update progress', 'error');
    }
  };

  // Add Project Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post('/comments', { text: commentText.trim(), projectId: id });
      const newComment = res.data.comment;
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      showToast('Comment posted to project thread');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Add Task to this project
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !project) return;
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        project: project.title,
        projectId: project._id,
        priority: taskForm.priority,
        status: taskForm.status,
        date: taskForm.date
      };

      const res = await api.post('/tasks', payload);
      const created = res.data.task || res.data;
      setTasks(prev => [created, ...prev]);
      showToast('Task added to project sprint!');
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'todo',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    } catch (err: any) {
      showToast('Failed to create task', 'error');
    }
  };

  // Task Status Transition
  const handleTaskStatusChange = async (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    try {
      setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task moved to ${newStatus === 'done' ? 'Completed' : newStatus === 'inProgress' ? 'In Progress' : 'To Do'}`);
    } catch (err) {
      showToast('Failed to update task status', 'error');
      loadProjectData();
    }
  };

  // Export Brief CSV
  const handleExportBrief = () => {
    if (!project) return;
    const lines = [
      ['ClientFlow Project 360 Brief'],
      ['Project Title', project.title],
      ['Status', project.status],
      ['Completion Rate', `${project.progress}%`],
      ['Contracted Client', project.client?.name || 'Unassigned'],
      ['Assigned Developer', project.developer?.name || 'Unassigned'],
      ['Budget', `$${(project.budget || 0).toLocaleString()}`],
      ['Deadline', project.deadline || 'Flexible'],
      [],
      ['Task Deliverables', 'Priority', 'Status'],
      ...tasks.map(t => [t.title, t.priority, t.status])
    ];

    const csvContent = lines.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Project_${project.title.replace(/\s+/g, '_')}_Brief.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <span>Loading Project 360° Portal...</span>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle2 size={12}/> Completed</span>;
    }
    if (status === 'in-progress') {
      return <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12}/> In Progress</span>;
    }
    return <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12}/> Pending</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* Toast */}
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

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{project.title}</span>
      </div>

      {/* Main Project Header Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div className="dashboard-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{project.title}</h2>
              {getStatusBadge(project.status)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
              {project.description || 'Enterprise project portfolio managed on ClientFlow platform.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="dashboard-action-controls" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="dashboard-action-btn"
              onClick={() => loadProjectData(true)}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.85rem',
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Sync
            </button>

            <button
              className="dashboard-action-btn"
              onClick={handleExportBrief}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.85rem',
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <Download size={14} /> Export Brief
            </button>

            {!isClient && project.status !== 'completed' && (
              <button
                className="dashboard-action-btn"
                onClick={() => handleUpdateStatus('completed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={14} /> Mark Completed
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Quick Stats (4 Items in ONE ROW) */}
        <div className="dashboard-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--surface-border)' }}>
          {/* Progress Slider */}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>Completion Velocity</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{project.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${project.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '4px', transition: 'width 0.4s' }} />
            </div>
            {!isClient && (
              <input
                type="range"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) => handleUpdateProgress(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem', cursor: 'pointer' }}
              />
            )}
          </div>

          {/* Client Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={18} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'block' }}>Contracted Client</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.client?.name || 'Independent Client'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.client?.email}</div>
            </div>
          </div>

          {/* Developer Assigned */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'block' }}>Lead Engineer</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.developer?.name || 'Unassigned'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.developer?.email || 'Engineering Pool'}</div>
            </div>
          </div>

          {/* Budget & Deadline */}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'block' }}>Budget & Timeline</span>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ${(project.budget || 0).toLocaleString()} USD
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Due: {project.deadline || 'Flexible'}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--surface-border)',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: 'Overview & Specs', icon: FolderKanban },
          { id: 'tasks', label: `Sprint Tasks (${tasks.length})`, icon: CheckSquare },
          { id: 'discussion', label: `Discussions (${comments.length})`, icon: MessageSquare },
          { id: 'audit', label: `Activity Audit (${activities.length})`, icon: ActivityIcon }
        ].map((t) => {
          const isSelected = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="project-detail-grid">
          {/* Left: Project Scope */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--glass-shadow)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Scope & Acceptance Criteria</h3>
            <div style={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1.25rem', lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {project.description || 'Enterprise project deliverable specified under client Master Services Agreement.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Contract Created:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Target Deadline:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{project.deadline || 'Ongoing'}</span>
              </div>
            </div>
          </div>

          {/* Right: Milestone Health */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--glass-shadow)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Milestone Execution Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Deliverables</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0 0', color: 'var(--text-main)' }}>{tasks.length}</h4>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0 0', color: '#10b981' }}>
                  {tasks.filter(t => t.status === 'done').length}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS & SPRINT */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Project Sprint Deliverables</h3>
            {!isClient && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="btn-primary"
                style={{ width: 'auto', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              >
                <Plus size={15} /> Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks logged for this project yet.
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Task Title</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id || t.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>{t.title}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: t.priority === 'High' ? '#ef4444' : 'var(--primary)' }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.status === 'done' ? '#10b981' : t.status === 'inProgress' ? '#3b82f6' : '#f59e0b' }}>
                          {t.status === 'done' ? 'Completed' : t.status === 'inProgress' ? 'In Progress' : 'To Do'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.date}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <select
                          value={t.status}
                          onChange={(e: any) => handleTaskStatusChange(t._id || t.id!, e.target.value)}
                          style={{
                            background: 'var(--bg-color)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="todo">To Do</option>
                          <option value="inProgress">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISCUSSION THREAD */}
      {activeTab === 'discussion' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Project Discussion Thread</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>Collaborative communication between Client, Lead Developer, and Agency Admin.</p>
          </div>

          {/* Comment input form */}
          <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <textarea
              rows={2}
              placeholder="Post a project update, question, or approval..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="btn-primary"
              style={{
                marginTop: 0,
                width: 'auto',
                padding: '0.75rem 1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: !commentText.trim() ? 0.6 : 1
              }}
            >
              <Send size={15} /> Post
            </button>
          </form>

          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No discussions posted yet. Start the conversation above!
              </div>
            ) : (
              comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
<UserAvatar avatar={c.user?.avatar} name={c.user?.name} size={32} />
                  <div style={{ flex: 1, background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.85rem 1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.user?.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Project Audit Trail & Events</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem' }}>Verifiable log of changes recorded in MongoDB Atlas.</p>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No audit logs recorded for this project yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ActivityIcon size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a.user?.name || 'System'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{a.action}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
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
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Add Task to {project.title}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement authentication middleware"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e: any) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Due Date</label>
                  <input
                    type="text"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.5rem' }}>Add Deliverable</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
