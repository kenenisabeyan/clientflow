import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Plus, Search, Filter, Download, RefreshCw, CheckCircle2, 
  AlertCircle, Clock, DollarSign, FileText, X, ChevronRight, 
  CreditCard, Printer, Eye, Trash2, ArrowUpRight, ShieldCheck,
  Building, User, Calendar
} from 'lucide-react';

interface InvoiceItem {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  client: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
  } | null;
  project?: {
    _id: string;
    title: string;
  } | null;
  amount: number;
  currency?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  dueDate: string;
  issueDate?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes?: string;
  createdAt?: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
}

interface ProjectOption {
  _id: string;
  title: string;
}

export default function Invoices() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  // Data State
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [clients, setClients] = useState<UserOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue' | 'Draft'>('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    amount: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Pending' as 'Paid' | 'Pending' | 'Overdue' | 'Draft',
    description: 'Enterprise Software Engineering & SLA',
    notes: 'Payment is due within 14 days of invoice receipt.'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInvoices = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [invRes, usersRes, projRes] = await Promise.allSettled([
        api.get('/invoices'),
        api.get('/users?role=client'),
        api.get('/projects')
      ]);

      if (invRes.status === 'fulfilled' && invRes.value.data.invoices) {
        setInvoices(invRes.value.data.invoices);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.data.users) {
        setClients(usersRes.value.data.users);
      }

      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }

      if (isManual) showToast('Invoices loaded live from MongoDB Atlas!');
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      if (isManual) showToast('Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Create Invoice (Admin)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount || !formData.dueDate) {
      showToast('Please select a client, amount, and due date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client: formData.clientId,
        project: formData.projectId || null,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        items: [
          {
            description: formData.description || 'Enterprise Cloud Services',
            quantity: 1,
            rate: Number(formData.amount),
            amount: Number(formData.amount)
          }
        ],
        notes: formData.notes
      };

      const res = await api.post('/invoices', payload);
      const newInv = res.data.invoice;
      setInvoices(prev => [newInv, ...prev]);
      showToast('Invoice created and recorded in MongoDB Atlas!');
      setIsCreateModalOpen(false);
      setFormData({
        clientId: '',
        projectId: '',
        amount: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending',
        description: 'Enterprise Software Engineering & SLA',
        notes: 'Payment is due within 14 days of invoice receipt.'
      });
      fetchInvoices();
    } catch (err: any) {
      console.error('Invoice create error:', err);
      showToast(err.response?.data?.message || 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Pay Invoice (Client & Admin)
  const handleConfirmPayment = async () => {
    if (!payingInvoice) return;
    setProcessingPayment(true);
    try {
      const res = await api.post(`/invoices/${payingInvoice._id || payingInvoice.id}/pay`);
      const updated = res.data.invoice;

      // Update state
      setInvoices(prev => prev.map(inv => (inv._id === payingInvoice._id ? { ...inv, status: 'Paid' } : inv)));
      showToast('Payment successful! Invoice marked as Paid.');
      setPayingInvoice(null);
      if (viewInvoice?._id === payingInvoice._id) {
        setViewInvoice(prev => prev ? { ...prev, status: 'Paid' } : null);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      showToast(err.response?.data?.message || 'Payment processing failed', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Delete Invoice (Admin)
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice record?')) return;
    try {
      await api.delete(`/invoices/${invoiceId}`);
      setInvoices(prev => prev.filter(inv => inv._id !== invoiceId && inv.id !== invoiceId));
      showToast('Invoice deleted successfully');
      if (viewInvoice?._id === invoiceId) setViewInvoice(null);
    } catch (err: any) {
      console.error('Delete invoice error:', err);
      showToast('Failed to delete invoice', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      showToast('No invoices to export', 'error');
      return;
    }
    const headers = ['Invoice Number,Client,Project,Amount,Status,Due Date'];
    const rows = filteredInvoices.map(inv => {
      const clientName = inv.client?.name || 'Unassigned';
      const projectTitle = inv.project?.title || 'General Account';
      return `"${inv.invoiceNumber}","${clientName}","${projectTitle}","${inv.amount}","${inv.status}","${inv.dueDate}"`;
    });
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Invoices exported to CSV!');
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const clientName = inv.client?.name || '';
      const invNum = inv.invoiceNumber || '';
      const matchSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invNum.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Financial Metrics
  const financialMetrics = useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const paid = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const pending = invoices.filter(inv => inv.status === 'Pending').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const overdue = invoices.filter(inv => inv.status === 'Overdue').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    return { total, paid, pending, overdue };
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    let color = '#f59e0b';
    let bg = 'rgba(245, 158, 11, 0.1)';
    let icon = <Clock size={12} />;

    if (status === 'Paid') {
      color = '#10b981';
      bg = 'rgba(16, 185, 129, 0.1)';
      icon = <CheckCircle2 size={12} />;
    } else if (status === 'Overdue') {
      color = '#ef4444';
      bg = 'rgba(239, 68, 68, 0.1)';
      icon = <AlertCircle size={12} />;
    } else if (status === 'Draft') {
      color = 'var(--text-muted)';
      bg = 'var(--surface-border)';
      icon = <FileText size={12} />;
    }

    return (
      <span style={{
        color,
        background: bg,
        padding: '0.25rem 0.65rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        border: `1px solid ${color}33`
      }}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* Toast Alert */}
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
              {isClient ? 'My Invoices & Payments' : 'Invoices & Financial Accounts'}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary)'
            }}>
              {invoices.length} Invoices
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {isClient ? 'Review your contract billing statements, download receipts, and submit online payments.' : 'Issue, track, and reconcile professional client billing statements and enterprise retainers.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => fetchInvoices(true)}
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

          {isAdmin && (
            <button
              onClick={() => {
                setFormData({
                  clientId: clients[0]?._id || '',
                  projectId: projects[0]?._id || '',
                  amount: '',
                  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  status: 'Pending',
                  description: 'Enterprise Software Engineering & SLA',
                  notes: 'Payment is due within 14 days of invoice receipt.'
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
              <Plus size={16} /> New Invoice
            </button>
          )}
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '1rem'
      }}>
        {/* Total Billed */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Billed</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)' }}>
              ${financialMetrics.total.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Paid Revenue */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Paid & Settled</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)' }}>
              ${financialMetrics.paid.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Pending Receivables */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pending Receivables</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)' }}>
              ${financialMetrics.pending.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Overdue */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Overdue Balance</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--text-main)' }}>
              ${financialMetrics.overdue.toLocaleString()}
            </h3>
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
        {/* Search */}
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
            placeholder="Search invoice number, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
          {searchTerm && (
            <X size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
          )}
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['All', 'Paid', 'Pending', 'Overdue', 'Draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === s ? 'var(--primary)' : 'var(--surface-border)',
                background: statusFilter === s ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-color)',
                color: statusFilter === s ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span>Loading invoices from MongoDB Atlas...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
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
            <FileText size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>No invoices found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0, fontSize: '0.9rem' }}>
            {searchTerm || statusFilter !== 'All' 
              ? 'No invoices match your current search or status filter.' 
              : 'No invoices have been generated yet.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
              style={{ width: 'auto', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> Create Invoice
            </button>
          )}
        </div>
      ) : (
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
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Invoice ID</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Client Name</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv._id || inv.id}
                  style={{
                    borderBottom: '1px solid var(--surface-border)',
                    transition: 'background 0.15s'
                  }}
                >
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                      <span>{inv.invoiceNumber}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    <div>{inv.client?.name || 'Independent Client'}</div>
                    {inv.client?.company && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.client.company}</div>
                    )}
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    {getStatusBadge(inv.status)}
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {inv.dueDate}
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Pay Now Button for Pending or Overdue Invoices */}
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <CreditCard size={13} /> Pay Now
                        </button>
                      )}

                      {/* View Drawer Button */}
                      <button
                        onClick={() => setViewInvoice(inv)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.08)',
                          color: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={13} /> View
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteInvoice(inv._id || inv.id!)}
                          style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: 'none',
                            padding: '0.4rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Delete invoice"
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
            <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
            <span>ClientFlow Enterprise Financial Ledger</span>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL (Admin) */}
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Create Invoice</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Issue a formal billing statement to a client</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Select Client *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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
                  <option value="">Select a Client Account</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Link Project (Optional)</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
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
                  <option value="">General Retainer / Independent</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Due Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Line Item Description</label>
                <input
                  type="text"
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
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Notes / Terms</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {submitting ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY INVOICE MODAL */}
      {payingInvoice && (
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            animation: 'scaleUp 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Complete Payment</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{payingInvoice.invoiceNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Billed To:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{payingInvoice.client?.name || 'Client'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Due Date:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{payingInvoice.dueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Amount Due:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>${payingInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              color: 'var(--text-main)'
            }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>Simulated 256-bit encrypted checkout. Clicking confirm updates status to <strong>Paid</strong> in live database.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
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
                type="button"
                onClick={handleConfirmPayment}
                disabled={processingPayment}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {processingPayment ? 'Processing...' : `Pay $${payingInvoice.amount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW INVOICE 360° DRAWER */}
      {viewInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setViewInvoice(null)}
        >
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--surface)',
            height: '100%',
            padding: '2.5rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>ClientFlow</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>| Official Invoice</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => window.print()}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
                  title="Print invoice"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Invoice Meta Card */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--surface-border)',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Number</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.2rem 0 0', color: 'var(--text-main)' }}>{viewInvoice.invoiceNumber}</h3>
                </div>
                {getStatusBadge(viewInvoice.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Due Date:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{viewInvoice.dueDate}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Currency:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>USD ($)</span>
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed Client</span>
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{viewInvoice.client?.name || 'Client Account'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{viewInvoice.client?.email}</div>
                {viewInvoice.client?.company && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{viewInvoice.client.company}</div>
                )}
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Line Items</span>
              <div style={{ border: '1px solid var(--surface-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items && viewInvoice.items.length > 0 ? (
                      viewInvoice.items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                          <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-main)' }}>{it.description}</td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>{it.quantity || 1}</td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>${(it.amount || viewInvoice.amount).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-main)' }}>Professional Services & SLA</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>1</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>${viewInvoice.amount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Balance */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>${viewInvoice.amount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '0.6rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                <span>Grand Total:</span>
                <span style={{ color: viewInvoice.status === 'Paid' ? '#10b981' : 'var(--primary)' }}>${viewInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            {viewInvoice.notes && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Notes:</strong> {viewInvoice.notes}
              </div>
            )}

            {/* Bottom Actions */}
            {viewInvoice.status !== 'Paid' && (
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                <button
                  onClick={() => {
                    setPayingInvoice(viewInvoice);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <CreditCard size={18} /> Pay Invoice Now (${viewInvoice.amount.toLocaleString()})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
