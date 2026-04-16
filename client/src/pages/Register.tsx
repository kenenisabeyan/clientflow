import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const result = await register(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'var(--bg-color)', padding: '2rem' 
    }}>
      <div style={{ 
        display: 'flex', width: '1000px', maxWidth: '100%', minHeight: '600px',
        background: 'var(--surface)', border: '1px solid var(--surface-border)', 
        borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' 
      }}>
        
        {/* Left Graphics Panel */}
        <div style={{ 
          flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderRight: '1px solid var(--surface-border)', position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            ClientFlow
          </div>
          
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>Create Account ✨</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.5 }}>Join ClientFlow today and manage all your clients, invoices, and tasks in one place.</p>
            
            {/* Mock Illustration Box */}
            <div style={{ 
              width: '100%', height: '240px', background: 'rgba(15,23,42,0.5)', 
              borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '150px', height: '150px', background: 'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%238b5cf6\\' stroke-width=\\'1\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'%3E%3Cpath d=\\'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\\'%3E%3C/path%3E%3Ccircle cx=\\'12\\' cy=\\'7\\' r=\\'4\\'%3E%3C/circle\\'%3E%3C/svg%3E") no-repeat center', backgroundSize: 'contain', opacity: 0.8 }}></div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div style={{ flex: 1, padding: '2.5rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sign Up</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email</label>
              <input 
                type="email" 
                placeholder="john@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', outline: 'none', letterSpacing: '2px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', outline: 'none', letterSpacing: '2px' }}
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" required style={{ accentColor: 'var(--primary)' }} />
                I agree to the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a>
              </label>
            </div>

            <button type="submit" style={{ 
              width: '100%', padding: '0.85rem', background: 'var(--primary)', color: 'white', 
              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem',
              boxShadow: '0 4px 14px rgba(59,130,246,0.3)'
            }}>Create Account</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </button>
            <button style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}