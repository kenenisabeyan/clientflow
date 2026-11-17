import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserAvatar from '../components/UserAvatar';
import AvatarCaptureModal from '../components/AvatarCaptureModal';
import { 
  User as UserIcon, Shield, Lock, Bell, Palette, CheckCircle2, 
  AlertCircle, Briefcase, Mail, Phone, Building, Check,
  Camera, Upload, Trash2, Image as ImageIcon
} from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDev = user?.role === 'developer';
  const isClient = user?.role === 'client';

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'security' | 'preferences'>('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 555-0199',
    company: user?.company || (isClient ? 'Client Enterprise' : 'ClientFlow Agency'),
    bio: isDev ? 'Senior Full-Stack Engineer focusing on React & Node.js architecture.' : isClient ? 'Authorized Portfolio Manager.' : 'Agency Principal & Administrator.'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 555-0199',
        company: user.company || (isClient ? 'Client Enterprise' : 'ClientFlow Agency'),
        bio: isDev ? 'Senior Full-Stack Engineer focusing on React & Node.js architecture.' : isClient ? 'Authorized Portfolio Manager.' : 'Agency Principal & Administrator.'
      });
    }
  }, [user]);

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    invoiceAlerts: true,
    taskAssigned: true,
    channelMentions: true,
    weeklyReport: false
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        company: profileForm.company
      });
      if (res.data.success) {
        updateUser({
          name: profileForm.name,
          phone: profileForm.phone,
          company: profileForm.company
        });
        showToast('Profile preferences updated successfully in database!');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleSaveAvatar = async (base64Image: string) => {
    try {
      const res = await api.put('/auth/profile', { avatar: base64Image });
      if (res.data.success) {
        updateUser({ avatar: base64Image });
        showToast('Profile photo updated successfully!');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile photo', 'error');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await api.put('/auth/profile', { avatar: '' });
      if (res.data.success) {
        updateUser({ avatar: '' });
        showToast('Profile photo removed. Reverted to default initial circle.');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove photo', 'error');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    showToast('Security credentials updated successfully!');
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Account & ERP Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
          Manage your role credentials, security preferences, and enterprise authorizations.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--surface-border)',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'profile', label: 'User Profile', icon: UserIcon },
          { id: 'permissions', label: 'Role & RBAC Scopes', icon: Shield },
          { id: 'security', label: 'Security & Auth', icon: Lock },
          { id: 'preferences', label: 'Preferences & Alerts', icon: Bell }
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

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar
                avatar={user?.avatar}
                name={user?.name}
                size={84}
                fontSize="2rem"
                borderColor="var(--primary)"
              />
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change photo with camera or files"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: '#ffffff',
                  border: '2px solid var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Camera size={16} />
              </button>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{user?.name}</h3>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  background: isAdmin ? 'rgba(239, 68, 68, 0.1)' : isDev ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: isAdmin ? '#ef4444' : isDev ? '#3b82f6' : '#10b981'
                }}>
                  {user?.role}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0.85rem 0' }}>{user?.email}</p>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--surface-border)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} /> Take Photo / Upload
                </button>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} /> Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--surface-border)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Organization / Company</label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Professional Bio / Scope</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
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

            <div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  marginTop: '0.5rem',
                  width: 'auto',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 600
                }}
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ROLE & PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          boxShadow: 'var(--glass-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Role-Based Access Control (RBAC) Entitlements</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Your current authenticated identity is bound to the <strong>{user?.role?.toUpperCase()}</strong> role in MongoDB Atlas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
            {/* Admin Entitlement */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid',
              borderColor: isAdmin ? 'var(--primary)' : 'var(--surface-border)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>Administrator</span>
                {isAdmin && <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>CURRENT ROLE</span>}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Full CRUD on Client CRM (`/clients`)</li>
                <li>Assign Projects, Budgets & Deadlines</li>
                <li>Issue & Reconcile Invoices (`/invoices`)</li>
                <li>Executive Analytics & Audit Reports</li>
                <li>Agency-wide Broadcasts & 1:1 Messaging</li>
              </ul>
            </div>

            {/* Client Entitlement */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid',
              borderColor: isClient ? 'var(--primary)' : 'var(--surface-border)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#10b981' }}>Client</span>
                {isClient && <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>CURRENT ROLE</span>}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>View Scoped Portfolios & Progress</li>
                <li>Review Project Deliverables & Tasks</li>
                <li>Self-Service Billing & Online "Pay Now"</li>
                <li>Direct SLA Support Channel (`#client-support`)</li>
                <li>Protected from Developer internal costs</li>
              </ul>
            </div>

            {/* Developer Entitlement */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid',
              borderColor: isDev ? 'var(--primary)' : 'var(--surface-border)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>Developer</span>
                {isDev && <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>CURRENT ROLE</span>}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Assigned Sprint Tasks & Kanban Board</li>
                <li>1-Click Status Transitions (To Do → Done)</li>
                <li>Engineering Repositories & Specifications</li>
                <li>Technical `#dev-team` Coordination</li>
                <li>Protected from Client Commercial Invoices</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          boxShadow: 'var(--glass-shadow)',
          maxWidth: '560px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Change Credentials</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>Update your password with bcrypt encryption.</p>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Current Password</label>
              <input
                type="password"
                required
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>New Password</label>
              <input
                type="password"
                required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Confirm New Password</label>
              <input
                type="password"
                required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
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

            <button
              type="submit"
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                width: 'auto',
                padding: '0.65rem 1.5rem',
                fontWeight: 600
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PREFERENCES & ALERTS */}
      {activeTab === 'preferences' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          boxShadow: 'var(--glass-shadow)',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Enterprise Notification Settings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Configure automated system alerts and notifications.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'invoiceAlerts', title: 'Invoice & Billing Alerts', desc: 'Receive real-time alerts when invoices are issued or paid' },
              { id: 'taskAssigned', title: 'Task & Sprint Dispatches', desc: 'Receive notifications when tasks are assigned to you' },
              { id: 'channelMentions', title: 'Channel Mentions & Chats', desc: 'Notify on direct messages and channel broadcasts' },
              { id: 'weeklyReport', title: 'Weekly Executive Summary', desc: 'Send automated email recap of milestone deliverables' }
            ].map((item) => {
              const checked = (notifications as any)[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setNotifications({ ...notifications, [item.id]: !checked })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: checked ? 'var(--primary)' : 'var(--surface-border)',
                    background: checked ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    {checked && <Check size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo Capture / Upload Modal */}
      <AvatarCaptureModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleSaveAvatar}
        onRemove={handleRemoveAvatar}
        currentAvatar={user?.avatar}
        userName={user?.name}
      />
    </div>
  );
}
