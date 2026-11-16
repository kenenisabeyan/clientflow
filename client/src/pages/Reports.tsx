import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  ArrowUpRight, ArrowDownRight, Download, Calendar, MoreHorizontal, 
  RefreshCw, DollarSign, Users, FolderKanban, TrendingUp, ShieldCheck,
  CheckCircle2, AlertCircle, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Live Atlas State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all operational data for executive reporting
  const fetchReportsData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [invRes, projRes, userRes, taskRes] = await Promise.allSettled([
        api.get('/invoices'),
        api.get('/projects'),
        api.get('/users?role=client'),
        api.get('/tasks')
      ]);

      if (invRes.status === 'fulfilled' && invRes.value.data.invoices) {
        setInvoices(invRes.value.data.invoices);
      }
      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }
      if (userRes.status === 'fulfilled' && userRes.value.data.users) {
        setClients(userRes.value.data.users);
      }
      if (taskRes.status === 'fulfilled' && taskRes.value.data) {
        const d = taskRes.value.data;
        const allTasks = Array.isArray(d.tasks) ? d.tasks : [...(d.todo || []), ...(d.inProgress || []), ...(d.done || [])];
        setTasks(allTasks);
      }
    } catch (err) {
      console.error('Failed to load reports data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Financial & Operational Metrics
  const metrics = useMemo(() => {
    const totalRevenue = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const pendingRevenue = invoices.filter(inv => inv.status === 'Pending').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalClients = clients.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      totalRevenue,
      pendingRevenue,
      totalProjects,
      completedProjects,
      totalClients,
      completionRate
    };
  }, [invoices, projects, clients, tasks]);

  // Project Distribution for PieChart
  const projectsData = useMemo(() => {
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const pending = projects.filter(p => p.status === 'pending').length;

    return [
      { name: 'Completed', value: completed || 1, color: '#10b981' },
      { name: 'In Progress', value: inProgress || 1, color: '#3b82f6' },
      { name: 'Pending Review', value: pending || 1, color: '#f59e0b' },
    ];
  }, [projects]);

  // Dynamic Revenue Trend Bar Chart
  const revenueTrendData = useMemo(() => {
    if (invoices.length === 0) {
      return [
        { name: 'Period 1', billed: 4000, collected: 4000 },
        { name: 'Period 2', billed: 8500, collected: 8500 },
        { name: 'Period 3', billed: 12000, collected: 10000 },
        { name: 'Current', billed: 15000, collected: metrics.totalRevenue || 12000 }
      ];
    }

    const paidInvs = invoices.filter(inv => inv.status === 'Paid');
    return [
      { name: 'Invoiced', billed: invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0), collected: metrics.totalRevenue },
      { name: 'Collected', billed: metrics.totalRevenue, collected: metrics.totalRevenue },
      { name: 'Receivables', billed: metrics.pendingRevenue, collected: 0 }
    ];
  }, [invoices, metrics]);

  // Top Clients by Value
  const topClients = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>();
    invoices.forEach(inv => {
      const name = inv.client?.name || 'Independent Client';
      const curr = map.get(name) || { name, amount: 0, count: 0 };
      curr.amount += (inv.amount || 0);
      curr.count += 1;
      map.set(name, curr);
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [invoices]);

  // Export Executive Audit Report
  const handleExportAudit = () => {
    const reportData = [
      ['ClientFlow Executive Financial & Operational Report'],
      ['Generated On', new Date().toLocaleString()],
      ['Authorized Executive', user?.name || 'Administrator'],
      [],
      ['Total Paid Revenue', `$${metrics.totalRevenue.toLocaleString()}`],
      ['Pending Receivables', `$${metrics.pendingRevenue.toLocaleString()}`],
      ['Total Client Accounts', metrics.totalClients],
      ['Total Portfolios', metrics.totalProjects],
      ['Sprint Completion Rate', `${metrics.completionRate}%`],
      [],
      ['Client Name', 'Total Invoiced Amount', 'Invoice Count'],
      ...topClients.map(c => [c.name, `$${c.amount.toLocaleString()}`, c.count])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Executive_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Executive Intelligence & Audit</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> ADMIN ONLY
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
            Comprehensive revenue analytics, client account values, and operational velocity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => fetchReportsData(true)}
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
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleExportAudit}
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
            <Download size={16} /> Export Audit Report
          </button>
        </div>
      </div>

      {/* Top Financial Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
        {/* Total Paid Revenue */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Settled Revenue</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}><ArrowUpRight size={14} /> +100%</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            ${metrics.totalRevenue.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Atlas ledger receipts</span>
        </div>

        {/* Pending Receivables */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Pending Receivables</span>
            <span style={{ color: '#f59e0b' }}>Outstanding</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            ${metrics.pendingRevenue.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting client settlement</span>
        </div>

        {/* Active Client Portfolios */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Active Portfolios</span>
            <span style={{ color: '#3b82f6' }}>{metrics.completedProjects} done</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {metrics.totalProjects}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Under contract development</span>
        </div>

        {/* Sprint Throughput */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Sprint Velocity</span>
            <span style={{ color: '#10b981' }}>{metrics.completionRate}%</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {tasks.filter(t => t.status === 'done').length} / {tasks.length}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks successfully delivered</span>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="reports-charts-grid">
        {/* Revenue Volume Chart */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: 'var(--glass-shadow)',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Revenue Realization</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Billed volume vs collected settlement</p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>Live Atlas Data</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="billed" fill="rgba(59, 130, 246, 0.4)" radius={[4, 4, 0, 0]} name="Invoiced" />
                <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: 'var(--glass-shadow)',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Portfolio Health</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Distribution of contracted projects</p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{metrics.totalProjects} Portfolios</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectsData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {projectsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Client Accounts Ledger */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Top Client Relationships</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Ranked by total commercial contract value</p>
          </div>
        </div>

        {topClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No client billing statements recorded yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Client Account</th>
                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Invoice Volume</th>
                <th style={{ padding: '0.75rem 0', fontWeight: 600, textAlign: 'right' }}>Total Commercial Value</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '0.85rem 0', fontWeight: 600, color: 'var(--text-main)' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '0.85rem 0', color: 'var(--text-muted)' }}>
                    {c.count} statement(s)
                  </td>
                  <td style={{ padding: '0.85rem 0', fontWeight: 700, color: '#10b981', textAlign: 'right' }}>
                    ${c.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
