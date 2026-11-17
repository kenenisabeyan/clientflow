import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import UserAvatar from '../components/UserAvatar';
import AvatarCaptureModal from '../components/AvatarCaptureModal';
import { 
  Users, ShieldCheck, UserPlus, Search, Filter, Download, 
  Trash2, Edit3, X, CheckCircle2, AlertCircle, Clock, 
  Building2, Mail, Phone, Lock, RefreshCw, Key, Camera
} from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'developer';
  company?: string;
  phone?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'client' | 'developer'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'client' as 'admin' | 'client' | 'developer',
    company: '',
    phone: '',
    password: '',
    status: 'Active',
    avatar: ''
  });

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/users');
      if (res.data.users) {
        setUsers(res.data.users);
      }
      if (isManual) showToast('User directory synced with Atlas!');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter & Search
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchTerm.toLowerCase();
      const matchSearch = 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search) ||
        (u.company || '').toLowerCase().includes(search);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const clients = users.filter(u => u.role === 'client').length;
    const developers = users.filter(u => u.role === 'developer').length;
    return { total, admins, clients, developers };
  }, [users]);

  // 1-Click Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
        showToast(`Role updated to ${newRole.toUpperCase()} for user.`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  // Add / Invite User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      showToast('Name and email are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/users', userForm);
      if (res.data.success) {
        showToast(`User ${userForm.name} created as ${userForm.role.toUpperCase()}!`);
        setIsAddModalOpen(false);
        setUserForm({ name: '', email: '', role: 'client', company: '', phone: '', password: '', status: 'Active', avatar: '' });
        loadUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/users/${selectedUser._id}`, userForm);
      if (res.data.success) {
        showToast('User profile updated successfully!');
        setIsEditModalOpen(false);
        loadUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDelete = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action is irreversible.`)) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u._id !== userId));
        showToast(`User ${userName} deleted.`);
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to delete user', 'error');
      }
    }
  };

  // CSV Export
  const exportUsersCSV = () => {
    if (!users.length) return;
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Company', 'Phone', 'Status', 'Created At'];
    const rows = users.map(u => [
      `"${u._id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.company || 'N/A'}"`,
      `"${u.phone || 'N/A'}"`,
      `"${u.status || 'Active'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ClientFlow_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: 'rgba(99, 102, 241, 0.12)', text: 'var(--primary)', border: 'rgba(99, 102, 241, 0.3)' };
      case 'developer': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'client': return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.12)', text: 'var(--text-muted)', border: 'var(--surface-border)' };
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '2rem',
          zIndex: 110,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: 500,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} /> Team & Role Management (RBAC)
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Enterprise Role-Based Access Control: Orchestrate Admin, Client, and Developer entitlements.
          </p>
        </div>

        <div className="dashboard-action-controls" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="dashboard-action-btn"
            onClick={() => loadUsers(true)}
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
            onClick={exportUsersCSV}
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
              cursor: 'pointer'
            }}
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            className="dashboard-action-btn"
            onClick={() => {
              setUserForm({ name: '', email: '', role: 'client', company: '', phone: '', password: '', status: 'Active', avatar: '' });
              setIsAddModalOpen(true);
            }}
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
            <UserPlus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards in ONE ROW */}
      <div className="stats-grid dashboard-stats-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Members</h3>
          <p style={{ fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.total}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Registered ERP accounts</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admins</h3>
          <p style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.admins}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Full system authority</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Clients</h3>
          <p style={{ color: '#3b82f6', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.clients}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Stakeholders & billable</span>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.1rem', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Developers</h3>
          <p style={{ color: '#10b981', fontSize: '1.8rem', margin: '0.2rem 0', whiteSpace: 'nowrap' }}>{metrics.developers}</p>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Sprint engineers</span>
        </div>
      </div>

      {/* Search & Role Filter Tabs */}
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
            placeholder="Search users by name, email, company..."
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
          {(['all', 'admin', 'client', 'developer'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                border: '1px solid',
                borderColor: roleFilter === r ? 'var(--primary)' : 'var(--surface-border)',
                background: roleFilter === r ? 'var(--primary)' : 'transparent',
                color: roleFilter === r ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
      }}>
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--bg-color)' }}>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User / Member</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role (RBAC)</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Organization</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Clock size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                    <div>Loading users from Atlas...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const roleStyle = getRoleColor(u.role);
                  return (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--surface-border)' : 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
<UserAvatar avatar={u.avatar} name={u.name} size={36} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={12} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Role Selector */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            background: roleStyle.bg,
                            color: roleStyle.text,
                            border: `1px solid ${roleStyle.border}`,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="client">Client</option>
                          <option value="developer">Developer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Organization */}
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={14} style={{ color: 'var(--text-muted)' }} />
                          {u.company || 'Enterprise Partner'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {u.phone || '+1 555-0100'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981'
                        }}>
                          {u.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setUserForm({
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                company: u.company || '',
                                phone: u.phone || '',
                                password: '',
                                status: u.status || 'Active',
                                avatar: u.avatar || ''
                              });
                              setIsEditModalOpen(true);
                            }}
                            title="Edit User"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--surface-border)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              color: 'var(--text-main)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            title="Delete User"
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite / Add Member */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '16px',
            width: '480px',
            maxWidth: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Invite New ERP Member
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Profile Photo Capture / Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                <UserAvatar avatar={userForm.avatar} name={userForm.name || 'Member'} size={52} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Member Photo</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Take live photo from camera or upload from device</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--surface-border)',
                        background: 'var(--surface)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Camera size={13} /> {userForm.avatar ? 'Change Photo' : 'Upload / Snap Photo'}
                    </button>
                    {userForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setUserForm(prev => ({ ...prev, avatar: '' }))}
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Role (RBAC) *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    <option value="client">Client</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Defaults to 12345678"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Studio"
                    value={userForm.company}
                    onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 555-0100"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#ffffff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '16px',
            width: '480px',
            maxWidth: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Edit User: {selectedUser.name}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Profile Photo Capture / Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                <UserAvatar avatar={userForm.avatar} name={userForm.name || 'Member'} size={52} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Member Photo</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Take live photo from camera or upload from device</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--surface-border)',
                        background: 'var(--surface)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Camera size={13} /> {userForm.avatar ? 'Change Photo' : 'Upload / Snap Photo'}
                    </button>
                    {userForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setUserForm(prev => ({ ...prev, avatar: '' }))}
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Role (RBAC)
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    <option value="client">Client</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Status
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={userForm.company}
                    onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#ffffff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Capture / Upload Modal */}
      <AvatarCaptureModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={(img) => setUserForm(prev => ({ ...prev, avatar: img }))}
        onRemove={() => setUserForm(prev => ({ ...prev, avatar: '' }))}
        currentAvatar={userForm.avatar}
        userName={userForm.name}
      />
    </div>
  );
}
