import { useState } from 'react';
import { Camera } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your account and preferences.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '0.5rem' }}>
        {['Profile', 'Security', 'Notifications', 'Preferences'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'transparent', border: 'none', padding: '1rem 0', cursor: 'pointer',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)', 
              fontWeight: activeTab === tab ? 600 : 500,
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Information Form */}
      {activeTab === 'Profile' && (
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem'
        }}>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>Profile Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <input type="text" defaultValue="John Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email</label>
                <input type="email" defaultValue="johndoe@example.com" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Phone</label>
                <input type="text" defaultValue="+1 555-0123" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Bio</label>
                <textarea 
                  defaultValue="Full stack developer and project manager."
                  style={{ 
                    width: '100%', padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', 
                    border: '1px solid var(--surface-border)', borderRadius: '8px', 
                    color: 'var(--text-main)', fontFamily: 'var(--font-main)', minHeight: '100px', resize: 'vertical'
                  }} 
                />
              </div>
              <div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Save Changes</button>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>Profile Picture</label>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-color)', 
                  border: '2px dashed var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                   <span style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: 'bold' }}>J</span>
                </div>
                <button style={{ 
                  position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', border: 'null', 
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  <Camera size={18} />
                </button>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Change Avatar</span>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}