import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, 
  Users, Building2, Phone, Mail, CheckCircle2, Clock, AlertCircle, 
  Download, Eye, Edit3, Trash2, X, ShieldCheck, FolderKanban, Briefcase, RefreshCw,
  MessageSquare, FileText
} from 'lucide-react';
import api from '../api/axios';

interface ClientItem {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'Active' | 'Pending' | 'Inactive';
  role: string;
  createdAt?: string;
}

interface ProjectItem {
  _id: string;
  title: string;
  status: string;
  client?: any;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Active Dropdown Row ID
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active' as 'Active' | 'Pending' | 'Inactive',
    password: '',
  });

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Clients & Associated Projects
  const fetchClientsData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [usersRes, projRes] = await Promise.allSettled([
        api.get('/users?role=client'),
        api.get('/projects')
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.data.users) {
        const mapped = usersRes.value.data.users.map((u: any) => ({
          _id: u._id,
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+1 555-0100',
          company: u.company || 'Enterprise Client',
          status: u.status || 'Active',
          role: u.role || 'client',
          createdAt: u.createdAt || new Date().toISOString()
        }));
        setClients(mapped);
      }

      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        setProjects(projRes.value.data.projects);
      }

      if (isManual) showToast('Client directory synced with MongoDB Atlas!');
    } catch (err: any) {
      console.error('Failed to fetch clients', err);
      showToast('Error syncing clients: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClientsData();
  }, []);

  // Filtered & Searched Clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.company || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  // Paginated Clients Slice
  const totalClients = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalClients / pageSize));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // Reset to page 1 on filter or search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Computed ERP Metrics
  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'Active').length;
    const pending = clients.filter(c => c.status === 'Pending').length;
    const totalProjects = projects.length;
    return { total, active, pending, totalProjects };
  }, [clients, projects]);

  // Action: Add Client
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) {
      showToast('Name and email are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/users', {
        ...clientForm,
        role: 'client'
      });
      if (res.data.success) {
        showToast(`Client "${clientForm.name}" created and synced to MongoDB Atlas!`);
        setIsAddModalOpen(false);
        setClientForm({ name: '', email: '', phone: '', company: '', status: 'Active', password: '' });
        fetchClientsData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating client', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Update Client
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/users/${selectedClient._id}`, {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        company: clientForm.company,
        status: clientForm.status
      });
      if (res.data.success) {
        showToast(`Client "${clientForm.name}" updated successfully!`);
        setIsEditModalOpen(false);
        fetchClientsData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating client', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Delete Client
  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from ClientFlow?`)) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        showToast(`Client "${name}" deleted from database.`);
        setClients(prev => prev.filter(c => c._id !== id));
        if (selectedClient?._id === id) setIsViewDrawerOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting client', 'error');
    }
  };

  // Open Edit Modal with Pre-filled Client Data
  const openEditModal = (client: ClientItem) => {
    setSelectedClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      status: client.status,
      password: '',
    });
    setOpenActionId(null);
    setIsEditModalOpen(true);
  };

  // Open 360 View Drawer
  const openViewProfile = (client: ClientItem) => {
    setSelectedClient(client);
    setOpenActionId(null);
    setIsViewDrawerOpen(true);
  };

  // Export Clients to CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Client Name', 'Email', 'Phone', 'Company / Account', 'Status', 'Account Created'],
      ...clients.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone || ''}"`,
        `"${c.company || ''}"`,
        c.status,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Client directory CSV exported!');
  };

  // Projects associated with the selected client
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter(p => {
      const pClientId = typeof p.client === 'object' ? p.client?._id : p.client;
      return pClientId === selectedClient._id;
    });
  }, [selectedClient, projects]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Toast Notification */}
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

      {/* Header & ERP Controls */}
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
              Client Directory & Relationship Management
            </h2>
            <span style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px'
            }}>
              CRM / ERP
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Manage client profiles, company associations, portal credentials, and project assignments.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchClientsData(true)}
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

          <button
            onClick={() => {
              setClientForm({ name: '', email: '', phone: '', company: '', status: 'Active', password: '' });
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
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* ERP Metric Cards (4 KPI Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {[
          { title: 'Total Clients', value: loading ? '...' : metrics.total, desc: 'Registered in database', icon: Users, color: '#3b82f6' },
          { title: 'Active Portals', value: loading ? '...' : metrics.active, desc: 'Full portal login access', icon: CheckCircle2, color: '#10b981' },
          { title: 'Pending Setup', value: loading ? '...' : metrics.pending, desc: 'Awaiting onboarding', icon: Clock, color: '#f59e0b' },
          { title: 'Linked Projects', value: loading ? '...' : metrics.totalProjects, desc: 'Active customer deliverables', icon: FolderKanban, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.title}</span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.2rem 0' }}>{stat.value}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.desc}</span>
            </div>
            <div style={{ background: `${stat.color}18`, color: stat.color, padding: '0.75rem', borderRadius: '12px' }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Client Table Card with Search & Working Filters */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        
        {/* Table Filter Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          {/* Search Box */}
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
              placeholder="Search by name, email, or company..."
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

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} /> Filter:
            </span>
            {(['All', 'Active', 'Pending', 'Inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: statusFilter === status ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                  background: statusFilter === status ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-color)',
                  color: statusFilter === status ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Client Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.01)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Client & Account</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Organization / Company</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    Loading clients from MongoDB Atlas...
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    No clients found matching the search or status filter.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';
                  const isActionOpen = openActionId === client._id;

                  return (
                    <tr
                      key={client._id}
                      style={{
                        borderBottom: '1px solid var(--surface-border)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Client Name & Email */}
                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: '#ffffff',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                          }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {client.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={12} /> {client.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization / Company */}
                      <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 500 }}>
                          <Building2 size={15} style={{ color: 'var(--text-muted)' }} />
                          {client.company || 'Enterprise Client'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Phone size={14} />
                          {client.phone || '+1 555-0100'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: client.status === 'Active' 
                            ? 'rgba(16, 185, 129, 0.12)' 
                            : client.status === 'Pending' 
                            ? 'rgba(245, 158, 11, 0.12)' 
                            : 'rgba(148, 163, 184, 0.15)',
                          color: client.status === 'Active' 
                            ? '#10b981' 
                            : client.status === 'Pending' 
                            ? '#f59e0b' 
                            : '#94a3b8',
                          border: `1px solid ${
                            client.status === 'Active' 
                              ? 'rgba(16, 185, 129, 0.25)' 
                              : client.status === 'Pending' 
                              ? 'rgba(245, 158, 11, 0.25)' 
                              : 'rgba(148, 163, 184, 0.25)'
                          }`
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: client.status === 'Active' ? '#10b981' : client.status === 'Pending' ? '#f59e0b' : '#94a3b8'
                          }} />
                          {client.status}
                        </span>
                      </td>

                      {/* Actions with Interactive Dropdown */}
                      <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                        <button
                          onClick={() => setOpenActionId(isActionOpen ? null : client._id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--surface-border)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.35rem 0.55rem',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown Menu */}
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
                            <button
                              onClick={() => openViewProfile(client)}
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
                              <Eye size={15} style={{ color: 'var(--primary)' }} /> 360° Profile
                            </button>
                            <button
                              onClick={() => openEditModal(client)}
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
                              <Edit3 size={15} style={{ color: '#f59e0b' }} /> Edit Client
                            </button>
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                handleDeleteClient(client._id, client.name);
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
                              <Trash2 size={15} /> Remove
                            </button>
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

        {/* Real Dynamic Pagination Bar */}
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
            Showing {totalClients === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalClients)} of {totalClients} clients
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
                  color: num === currentPage ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease'
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
          MODAL: Add Client
          ========================================= */}
      {isAddModalOpen && (
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
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Client Account</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Create ERP client profile with portal login credentials</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Mitchell"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@enterprise.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Corp"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={clientForm.status}
                    onChange={(e: any) => setClientForm({ ...clientForm, status: e.target.value })}
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
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Portal Password (defaults to 12345678)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty for default (12345678)"
                  value={clientForm.password}
                  onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
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
                  onClick={() => setIsAddModalOpen(false)}
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
                  {submitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: Edit Client
          ========================================= */}
      {isEditModalOpen && selectedClient && (
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Client Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateClient}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Account Status
                  </label>
                  <select
                    value={clientForm.status}
                    onChange={(e: any) => setClientForm({ ...clientForm, status: e.target.value })}
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
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  {submitting ? 'Saving...' : 'Update Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DRAWER / MODAL: 360° Client Profile View
          ========================================= */}
      {isViewDrawerOpen && selectedClient && (
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
            maxWidth: '580px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{selectedClient.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedClient.company || 'Enterprise Account'}</span>
                </div>
              </div>

              <button
                onClick={() => setIsViewDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1.25rem',
              background: 'var(--bg-color)',
              borderRadius: '8px',
              border: '1px solid var(--surface-border)',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email Address</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedClient.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phone</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedClient.phone || '+1 555-0100'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Portal Status</span>
                <div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: selectedClient.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: selectedClient.status === 'Active' ? '#10b981' : '#f59e0b'
                  }}>
                    {selectedClient.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Date</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Linked Projects Section */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderKanban size={18} style={{ color: 'var(--primary)' }} />
                Associated Projects ({clientProjects.length})
              </h4>

              {clientProjects.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                  No active projects currently assigned to this client.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {clientProjects.map((proj) => (
                    <Link
                      key={proj._id}
                      to={`/projects/${proj._id}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'border-color 0.15s'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>{proj.title}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to open 360° Portal</span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        textTransform: 'capitalize',
                        background: proj.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: proj.status === 'completed' ? '#10b981' : '#3b82f6'
                      }}>
                        {proj.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.85rem', marginTop: '1.75rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setIsViewDrawerOpen(false);
                    navigate('/messages');
                  }}
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <MessageSquare size={14} style={{ color: 'var(--primary)' }} /> Message
                </button>
                <button
                  onClick={() => {
                    setIsViewDrawerOpen(false);
                    navigate('/invoices');
                  }}
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FileText size={14} style={{ color: '#10b981' }} /> Invoices
                </button>
              </div>

              <button
                onClick={() => {
                  setIsViewDrawerOpen(false);
                  openEditModal(selectedClient);
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
