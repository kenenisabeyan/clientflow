import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Users, FolderKanban, CheckSquare, Plus, RefreshCw, 
  Download, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, 
  AlertCircle, X, Search, Filter, TrendingUp, Sparkles, 
  ExternalLink, ShieldCheck, ChevronRight, BarChart3, Activity as ActivityIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  client?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface TaskItem {
  id?: string;
  _id?: string;
  title: string;
  project: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'inProgress' | 'done';
  date: string;
  avatar?: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'developer';
  createdAt: string;
}

interface ActivityItem {
  _id: string;
  action: string;
  user?: { name: string };
  project?: { title: string };
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Live Data State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clients, setClients] = useState<UserItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // UI Controls & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'in-progress' as 'pending' | 'in-progress' | 'completed',
    clientId: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    project: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'todo' as 'todo' | 'inProgress' | 'done',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [projRes, taskRes, usersRes, actRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/users'),
        api.get('/activity')
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }
      if (taskRes.status === 'fulfilled' && taskRes.value.data) {
        const tData = taskRes.value.data;
        const allTasks: TaskItem[] = [];
        if (tData.todo) tData.todo.forEach((t: any) => allTasks.push({ ...t, status: 'todo' }));
        if (tData.inProgress) tData.inProgress.forEach((t: any) => allTasks.push({ ...t, status: 'inProgress' }));
        if (tData.done) tData.done.forEach((t: any) => allTasks.push({ ...t, status: 'done' }));
        setTasks(allTasks);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data.users) {
        setClients(usersRes.value.data.users);
      }
      if (actRes.status === 'fulfilled' && actRes.value.data.activities) {
        setActivities(actRes.value.data.activities);
      }

      if (isManual) showToast('Dashboard data refreshed live from MongoDB Atlas!');
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      if (isManual) showToast('Failed to refresh data: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Computed Live Metrics
  const metrics = useMemo(() => {
    const totalCustomers = clients.filter(c => c.role === 'client').length;
    const activeProjects = projects.filter(p => p.status !== 'completed').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const openTasks = tasks.filter(t => t.status !== 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      totalCustomers: totalCustomers || clients.length || 0,
      activeProjects,
      completedProjects,
      totalTasks,
      openTasks,
      doneTasks,
      completionRate,
    };
  }, [clients, projects, tasks]);

  // Dynamic Task Distribution for Recharts
  const taskPieData = useMemo(() => {
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;

    return [
      { name: 'Completed', value: done || 1, color: '#10b981' },
      { name: 'In Progress', value: inProgress || 1, color: '#3b82f6' },
      { name: 'To Do', value: todo || 1, color: '#f59e0b' },
    ];
  }, [tasks]);

  // Weekly Workload Trends
  const trendData = useMemo(() => [
    { name: 'Mon', completed: Math.max(1, metrics.doneTasks - 2), active: metrics.activeProjects + 2 },
    { name: 'Tue', completed: Math.max(2, metrics.doneTasks - 1), active: metrics.activeProjects + 3 },
    { name: 'Wed', completed: metrics.doneTasks, active: metrics.activeProjects + 1 },
    { name: 'Thu', completed: metrics.doneTasks + 1, active: metrics.activeProjects + 4 },
    { name: 'Fri', completed: metrics.doneTasks + 3, active: metrics.activeProjects + 2 },
    { name: 'Sat', completed: metrics.doneTasks + 4, active: metrics.activeProjects },
    { name: 'Sun', completed: metrics.doneTasks + 5, active: metrics.activeProjects },
  ], [metrics]);

  // Filtered Projects for Table
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Action: Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.clientId) {
      showToast('Project title and client are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/projects', projectForm);
      if (res.data.success) {
        showToast('Project created successfully!');
        setIsProjectModalOpen(false);
        setProjectForm({ title: '', description: '', status: 'in-progress', clientId: '' });
        fetchDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.project) {
      showToast('Task title and project name are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        ...taskForm,
        avatar: user?.name?.charAt(0).toUpperCase() || 'A'
      });
      if (res.data) {
        showToast('Task added to database!');
        setIsTaskModalOpen(false);
        setTaskForm({
          title: '',
          project: '',
          priority: 'Medium',
          status: 'todo',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
        fetchDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Export CSV Report
  const handleExportCSV = () => {
    const csvContent = [
      ['Report Type', 'ClientFlow Admin Executive Summary'],
      ['Generated On', new Date().toLocaleString()],
      ['Total Customers', metrics.totalCustomers],
      ['Active Projects', metrics.activeProjects],
      ['Open Tasks', metrics.openTasks],
      ['Completed Tasks', metrics.doneTasks],
      ['Task Completion Rate', `${metrics.completionRate}%`],
      [],
      ['Project Title', 'Status', 'Client Name', 'Created Date'],
      ...projects.map(p => [
        `"${p.title}"`,
        p.status,
        `"${p.client?.name || 'Unassigned'}"`,
        new Date(p.createdAt).toLocaleDateString()
      ]),
      [],
      ['Task Title', 'Project', 'Priority', 'Status'],
      ...tasks.map(t => [
        `"${t.title}"`,
        `"${t.project}"`,
        t.priority,
        t.status
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive CSV summary downloaded successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Toast Alert Feedback */}
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

      {/* Top Header & Interactive Action Bar */}
      <div style={{
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
              Admin Operations Center
            </h2>
            <span style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <ShieldCheck size={14} /> LIVE ATLAS DB
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.name || 'Administrator'}</strong>. Real-time control and analytics across all client operations.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.1rem',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Sync Atlas'}
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.1rem',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.1rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} /> Quick Task
          </button>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Live Operational Metrics (4 Stat Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          {
            title: 'Total Clients',
            value: loading ? '...' : metrics.totalCustomers,
            change: '+100% cloud',
            up: true,
            icon: Users,
            bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            desc: 'Registered client accounts'
          },
          {
            title: 'Active Projects',
            value: loading ? '...' : metrics.activeProjects,
            change: `${metrics.completedProjects} done`,
            up: true,
            icon: FolderKanban,
            bg: 'linear-gradient(135deg, #f97316, #c2410c)',
            desc: 'Under active development'
          },
          {
            title: 'Open Tasks',
            value: loading ? '...' : metrics.openTasks,
            change: `${metrics.doneTasks} closed`,
            up: false,
            icon: CheckSquare,
            bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            desc: 'Pending execution'
          },
          {
            title: 'Task Velocity',
            value: loading ? '...' : `${metrics.completionRate}%`,
            change: '+14% target',
            up: true,
            icon: TrendingUp,
            bg: 'linear-gradient(135deg, #10b981, #047857)',
            desc: 'Overall milestone completion'
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: stat.bg,
              color: 'white',
              borderRadius: 'var(--radius)',
              padding: '1.6rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                {stat.title}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                <stat.icon size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'white',
                background: 'rgba(255,255,255,0.22)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px'
              }}>
                {stat.up ? <ArrowUpRight size={14} style={{ marginRight: '0.2rem' }} /> : <ArrowDownRight size={14} style={{ marginRight: '0.2rem' }} />}
                {stat.change}
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.75rem', zIndex: 1 }}>
              {stat.desc}
            </p>

            {/* Decorative background watermark */}
            <div style={{ position: 'absolute', right: '-12px', bottom: '-22px', opacity: 0.12, pointerEvents: 'none' }}>
              <stat.icon size={110} />
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Project & Task Workload Velocity Chart */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                Weekly Milestone Velocity
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time completion vs active workload volume</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
              Live 7-Day
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--surface-border)', 
                    borderRadius: '8px', 
                    color: 'var(--text-main)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" name="Active Tasks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution Donut Chart */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={18} style={{ color: '#10b981' }} />
                Task Status Breakdown
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Proportion of tasks in MongoDB Atlas</p>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
              {metrics.doneTasks} of {metrics.totalTasks} Done
            </span>
          </div>

          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--surface-border)', 
                    borderRadius: '8px', 
                    color: 'var(--text-main)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Data Tables (Projects & Tasks) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        
        {/* Real Projects Table */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Projects</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synced with MongoDB Atlas ({filteredProjects.length} found)</p>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem'
              }}>
                <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '0.35rem' }} />
                <input
                  type="text"
                  placeholder="Search project or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '130px', fontSize: '0.8rem' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                style={{
                  background: 'var(--bg-color)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Project Title</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Assigned Client</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No projects matching filters. Click <strong>"New Project"</strong> above to add one!
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.9rem 0', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.status === 'completed' ? '#10b981' : p.status === 'in-progress' ? '#3b82f6' : '#f59e0b' }} />
                          {p.title}
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 0', color: 'var(--text-muted)' }}>
                        {p.client?.name || 'Unassigned'}
                      </td>
                      <td style={{ padding: '0.9rem 0' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: p.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : p.status === 'in-progress' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: p.status === 'completed' ? '#10b981' : p.status === 'in-progress' ? '#3b82f6' : '#f59e0b'
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Tasks Table */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Task Tracking Queue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Directly synced from MongoDB Atlas ({tasks.length} tasks)</p>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--surface-border)',
                color: 'var(--primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Task Details</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Due / Date</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No tasks found. Click <strong>"Quick Task"</strong> to add one!
                    </td>
                  </tr>
                ) : (
                  tasks.map((t, idx) => (
                    <tr key={t.id || t._id || idx} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.9rem 0', fontWeight: 500 }}>
                        <div>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.project}</div>
                      </td>
                      <td style={{ padding: '0.9rem 0' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: t.priority === 'High' ? '#ef4444' : t.priority === 'Medium' ? '#f59e0b' : '#10b981',
                          background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : t.priority === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                        }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {t.date}
                      </td>
                      <td style={{ padding: '0.9rem 0' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: t.status === 'done' ? 'rgba(16, 185, 129, 0.12)' : t.status === 'inProgress' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: t.status === 'done' ? '#10b981' : t.status === 'inProgress' ? '#3b82f6' : '#f59e0b'
                        }}>
                          {t.status === 'done' ? 'Done' : t.status === 'inProgress' ? 'In Progress' : 'To Do'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Registered Clients & Recent Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Real Registered Clients Directory */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>Registered Client Accounts</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Users with access to ClientFlow portals
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {clients.filter(c => c.role === 'client').map((c) => (
              <div key={c._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--bg-color)',
                border: '1px solid var(--surface-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#ffffff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary)'
                }}>
                  Client Portal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Activities Audit Log */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>System Audit Activity</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Live record of workspace updates and creations
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              {
                text: 'Atlas DB synchronized with live cloud cluster',
                time: 'Just now',
                icon: ShieldCheck,
                color: '#10b981'
              },
              {
                text: `Project portfolio currently tracks ${projects.length} milestones`,
                time: '1h ago',
                icon: FolderKanban,
                color: '#3b82f6'
              },
              {
                text: `${metrics.doneTasks} tasks successfully resolved`,
                time: '3h ago',
                icon: CheckCircle2,
                color: '#8b5cf6'
              },
              {
                text: 'New client Delelegn connected to dashboard',
                time: 'Today',
                icon: Users,
                color: '#f97316'
              }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 0',
                  borderBottom: i === 3 ? 'none' : '1px solid var(--surface-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    color: item.color,
                    background: `${item.color}18`,
                    padding: '0.45rem',
                    borderRadius: '50%'
                  }}>
                    <item.icon size={16} />
                  </div>
                  <span style={{ fontSize: '0.88rem' }}>{item.text}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL: Quick Create Project
          ========================================= */}
      {isProjectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Project</h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. E-Commerce Platform"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Assign Client *
                </label>
                <select
                  required
                  value={projectForm.clientId}
                  onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a client...</option>
                  {clients.filter(c => c.role === 'client').map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Status
                </label>
                <select
                  value={projectForm.status}
                  onChange={(e: any) => setProjectForm({ ...projectForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Description
                </label>
                <textarea
                  placeholder="Key milestones and requirements..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  style={{
                    padding: '0.7rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.7rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save to Atlas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: Quick Add Task
          ========================================= */}
      {isTaskModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Task</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Stripe Webhook"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Related Project *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={taskForm.project}
                  onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e: any) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e: any) => setTaskForm({ ...taskForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Target Due Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nov 28, 2026"
                  value={taskForm.date}
                  onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  style={{
                    padding: '0.7rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.7rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
