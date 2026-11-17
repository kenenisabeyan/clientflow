import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const isDark = theme === 'dark';

  return (
    <AuthLayout>
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.52)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
        padding: '2.4rem 1.75rem 1.85rem',
        boxShadow: isDark 
          ? '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset' 
          : '0 25px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        
        {/* Card Header (Matches Video Exactly) */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{
            fontSize: '2.05rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: isDark ? '#ffffff' : '#1e1b4b',
            margin: '0 0 0.4rem 0'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '0.92rem',
            color: isDark ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            Sign in to your <strong style={{ color: '#2563eb' }}>ClientFlow ERP</strong> account
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div style={{
            width: '100%',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out',
            boxSizing: 'border-box'
          }}>
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Username / Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              marginBottom: '0.4rem'
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. kenenisa@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '12px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              marginBottom: '0.4rem'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '12px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Remember Me & Forgot Password Row (From Video) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.15rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              cursor: 'pointer',
              fontSize: '0.88rem',
              color: isDark ? '#94a3b8' : '#475569',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  accentColor: '#2563eb',
                  cursor: 'pointer'
                }}
              />
              Remember me
            </label>

            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('For demo accounts, use Admin: kenenisa@gmail.com (pw: 123456) or Client: delelegn@gmail.com (pw: 12345678)');
              }}
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#4f46e5',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Forgot password?
            </a>
          </div>

          {/* Primary Action Button (Teal-Blue Gradient from Video) */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.95rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.02rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '0.75rem',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s ease',
              opacity: submitting ? 0.85 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to ClientFlow ERP</span>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons (Enterprise Role Testing) */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <span style={{
            fontSize: '0.76rem',
            color: isDark ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            1-Click Live MongoDB Atlas Credentials:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('kenenisa@gmail.com', '123456')}
              style={{
                padding: '0.55rem 0.4rem',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isDark ? '#93c5fd' : '#1d4ed8',
                cursor: 'pointer'
              }}
            >
              👑 Admin
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('delelegn@gmail.com', '12345678')}
              style={{
                padding: '0.55rem 0.4rem',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isDark ? '#86efac' : '#047857',
                cursor: 'pointer'
              }}
            >
              💼 Client
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('kidane@gmail.com', '12345678')}
              style={{
                padding: '0.55rem 0.4rem',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isDark ? '#c4b5fd' : '#6d28d9',
                cursor: 'pointer'
              }}
            >
              💻 Developer
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.88rem',
          color: isDark ? '#94a3b8' : '#64748b'
        }}>
          Don't have an ERP account?{' '}
          <Link
            to="/register"
            style={{
              color: '#0284c7',
              fontWeight: 700,
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Create an Account
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
