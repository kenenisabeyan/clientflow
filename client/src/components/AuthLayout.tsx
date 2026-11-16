import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Lightbulb } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: theme === 'dark' 
        ? 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 40%, #022c22 100%)'
        : 'linear-gradient(180deg, #fbcfe8 0%, #fed7aa 35%, #fef08a 70%, #dcfce7 100%)'
    }}>
      
      {/* Scenic Mountain & Pine Landscape Vector Background */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: theme === 'dark' ? 0.35 : 1
        }}
      >
        <defs>
          {/* Sky Sunrise / Sunset Gradient */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#fda4af" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#fdba74" stopOpacity="0.9" />
            <stop offset="90%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="1" />
          </linearGradient>

          {/* Sun Horizon Radial Glow */}
          <radialGradient id="sunGlow" cx="50%" cy="65%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#fed7aa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
          </radialGradient>

          {/* Mountains Gradient */}
          <linearGradient id="distantMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.85" />
          </linearGradient>

          {/* Rolling Hills Gradients */}
          <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="hillGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="hillGradFore" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        {/* Sky Fill */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Sun Glow on Horizon */}
        <ellipse cx="720" cy="580" rx="420" ry="240" fill="url(#sunGlow)" />

        {/* Distant Mountain Peaks */}
        <path
          d="M0,560 L140,460 L280,560 L460,410 L640,540 L820,380 L1020,530 L1200,430 L1340,520 L1440,470 L1440,900 L0,900 Z"
          fill="url(#distantMtnGrad)"
          opacity="0.45"
        />

        {/* Midground Rolling Hills */}
        <path
          d="M0,640 Q320,520 720,620 T1440,580 L1440,900 L0,900 Z"
          fill="url(#hillGrad1)"
          opacity="0.85"
        />

        <path
          d="M0,690 Q400,600 840,680 T1440,650 L1440,900 L0,900 Z"
          fill="url(#hillGrad2)"
          opacity="0.9"
        />

        {/* Foreground Hills */}
        <path
          d="M0,740 Q340,690 700,770 T1440,730 L1440,900 L0,900 Z"
          fill="url(#hillGrad3)"
        />

        {/* Left Hill with Trees */}
        <path
          d="M0,680 Q240,670 480,820 L0,900 Z"
          fill="url(#hillGradFore)"
        />

        {/* Right Hill with Trees */}
        <path
          d="M960,850 Q1220,700 1440,740 L1440,900 L960,900 Z"
          fill="url(#hillGradFore)"
        />

        {/* Left Side Pine Trees Group (Geometric Stepped Conifers) */}
        {/* Tree 1 - Tall Pine */}
        <g transform="translate(130, 560)">
          {/* Tree Trunk */}
          <rect x="-6" y="140" width="12" height="35" fill="#451a03" />
          {/* Tiers */}
          <polygon points="0,0 -42,60 -18,60 -54,110 -24,110 -68,160 68,160 24,110 54,110 18,60 42,60" fill="#064e3b" />
          <polygon points="0,0 0,160 68,160 24,110 54,110 18,60 42,60" fill="#047857" opacity="0.6" />
        </g>

        {/* Tree 2 - Mid Pine */}
        <g transform="translate(70, 620)">
          <rect x="-5" y="110" width="10" height="28" fill="#451a03" />
          <polygon points="0,0 -34,48 -14,48 -44,90 -20,90 -54,130 54,130 20,90 44,90 14,48 34,48" fill="#065f46" />
          <polygon points="0,0 0,130 54,130 20,90 44,90 14,48 34,48" fill="#059669" opacity="0.65" />
        </g>

        {/* Tree 3 - Small Pine */}
        <g transform="translate(190, 660)">
          <rect x="-4" y="85" width="8" height="22" fill="#451a03" />
          <polygon points="0,0 -26,38 -10,38 -34,70 -14,70 -42,102 42,102 14,70 34,70 10,38 26,38" fill="#047857" />
          <polygon points="0,0 0,102 42,102 14,70 34,70 10,38 26,38" fill="#10b981" opacity="0.6" />
        </g>

        {/* Tree 4 - Tiny Left Foreground */}
        <g transform="translate(25, 680)">
          <rect x="-4" y="70" width="8" height="20" fill="#451a03" />
          <polygon points="0,0 -22,32 -8,32 -28,60 -12,60 -36,86 36,86 12,60 28,60 8,32 22,32" fill="#064e3b" />
        </g>

        {/* Right Side Pine Trees */}
        {/* Tree 5 - Tall Right */}
        <g transform="translate(1350, 620)">
          <rect x="-5" y="120" width="10" height="30" fill="#451a03" />
          <polygon points="0,0 -38,52 -16,52 -48,96 -22,96 -58,140 58,140 22,96 48,96 16,52 38,52" fill="#064e3b" />
          <polygon points="0,0 0,140 58,140 22,96 48,96 16,52 38,52" fill="#047857" opacity="0.65" />
        </g>

        {/* Tree 6 - Mid Right */}
        <g transform="translate(1270, 670)">
          <rect x="-4" y="90" width="8" height="24" fill="#451a03" />
          <polygon points="0,0 -28,40 -12,40 -36,75 -16,75 -44,108 44,108 16,75 36,75 12,40 28,40" fill="#065f46" />
        </g>

        {/* Tree 7 - Small Right */}
        <g transform="translate(1410, 690)">
          <rect x="-4" y="75" width="8" height="20" fill="#451a03" />
          <polygon points="0,0 -24,35 -10,35 -30,65 -12,65 -38,92 38,92 12,65 30,65 10,35 24,35" fill="#047857" />
        </g>
      </svg>

      {/* Top Header Bar */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>
        
        {/* Top-Left: Modern Brand Mark & Logo (Exactly like video) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Dynamic Origami Emblem Icon */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
            transform: 'rotate(-4deg)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 9L12 16L21 9L12 2Z" fill="#ffffff" fillOpacity="0.9" />
              <path d="M3 9L12 16V22L3 15V9Z" fill="#ffffff" fillOpacity="0.7" />
              <path d="M21 9L12 16V22L21 15V9Z" fill="#ffffff" fillOpacity="0.5" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: theme === 'dark' ? '#ffffff' : '#0f172a',
              textTransform: 'uppercase',
              lineHeight: 1.1
            }}>
              CLIENTFLOW
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: '#0284c7',
              textTransform: 'uppercase'
            }}>
              ENTERPRISE PLATFORM
            </span>
          </div>
        </div>

        {/* Top-Right: "Enterprise Resource Planning" & "Bright Ideas / Illuminating Growth" Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Floating "Bright Ideas" Translucent Widget (From Recording) */}
          <div style={{
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '18px',
            padding: '0.65rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Glowing Lightbulb Avatar */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.55)',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Lightbulb size={20} style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.1rem'
              }}>
                Enterprise Resource Planning
              </span>
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                lineHeight: 1.1
              }}>
                Bright Ideas
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontStyle: 'italic',
                color: theme === 'dark' ? '#cbd5e1' : '#475569'
              }}>
                Illuminating Growth
              </span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '0.55rem',
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Glassmorphism Form Card */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        maxWidth: '470px',
        margin: 'auto',
        marginTop: '5.5rem',
        marginBottom: '2rem'
      }}>
        {children}
      </div>

      {/* Bottom Subtitle / Watermark */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        fontSize: '0.78rem',
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.55)',
        textAlign: 'center',
        padding: '0.5rem 0'
      }}>
        &copy; {new Date().getFullYear()} ClientFlow Enterprise ERP • High Availability Cloud Platform
      </footer>
    </div>
  );
}
