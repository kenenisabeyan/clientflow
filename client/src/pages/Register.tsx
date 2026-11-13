import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ 
        width: '420px', maxWidth: '90%',
        background: 'var(--surface)', border: '1px solid var(--surface-border)', 
        borderRadius: '24px', padding: '3rem 2.5rem',
        boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--blur)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        
        {/* Logo and Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' 
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome to ClientFlow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your workflow like a pro</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', width: '100%', background: 'rgba(15,23,42,0.05)', borderRadius: '12px', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <Link to="/login" style={{ flex: 1, color: 'var(--text-muted)', textAlign: 'center', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
             Login
          </Link>
          <div style={{ flex: 1, background: 'var(--surface)', color: 'var(--text-main)', textAlign: 'center', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'default', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
             Register
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            width: '100%',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Name</label>
            <input 
              type="text" 
              placeholder="Full Name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Email</label>
            <input 
              type="email" 
              placeholder="example@test.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              width: '100%', padding: '0.85rem', background: 'var(--primary)', color: '#fff', 
              border: 'none', borderRadius: '12px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', 
              marginTop: '0.5rem', opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              transition: 'var(--transition)'
            }}
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

      </div>
    </div>
  );
}
