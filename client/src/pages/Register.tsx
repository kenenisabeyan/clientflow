import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { theme } = useTheme();
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

  const isDark = theme === 'dark';

  return (
    <AuthLayout>
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.52)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '18px',
        padding: '1.75rem 1rem 1.25rem',
        boxShadow: isDark 
          ? '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset' 
          : '0 25px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        
        {/* Card Header (Matches Video Styling) */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: isDark ? '#ffffff' : '#1e1b4b',
            margin: '0 0 0.25rem 0'
          }}>
            Create Account
          </h1>
          <p style={{
            fontSize: '0.82rem',
            color: isDark ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            Register for your <strong style={{ color: '#2563eb' }}>ClientFlow ERP</strong> workspace
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            marginBottom: '0.85rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out',
            boxSizing: 'border-box'
          }}>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              marginBottom: '0.25rem'
            }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Kenenisa Beyan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.72rem 0.8rem',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Email / Username */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              marginBottom: '0.25rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. kenenisa@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.72rem 0.8rem',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              marginBottom: '0.25rem'
            }}>
              Create Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.72rem 0.8rem',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Primary Action Button (Teal-Blue Gradient from Video) */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.78rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '0.35rem',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              opacity: submitting ? 0.85 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create ClientFlow ERP Account</span>
            )}
          </button>
        </form>

        {/* Link back to Sign In */}
        <div style={{
          textAlign: 'center',
          marginTop: '0.95rem',
          fontSize: '0.8rem',
          color: isDark ? '#94a3b8' : '#64748b'
        }}>
          Already have an ERP account?{' '}
          <Link
            to="/login"
            style={{
              color: '#0284c7',
              fontWeight: 700,
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign In Here
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
