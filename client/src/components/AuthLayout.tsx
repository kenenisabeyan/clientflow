import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Lightbulb, Sparkles, X, Shuffle, SunMedium, Shield, Briefcase, Zap, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

interface IdeaItem {
  id: number;
  category: 'admin' | 'client' | 'developer' | 'general';
  categoryLabel: string;
  categoryIcon: React.ElementType;
  badgeColor: string;
  title: string;
  insight: string;
  metric: string;
}

const BRIGHT_IDEAS: IdeaItem[] = [
  {
    id: 1,
    category: 'general',
    categoryLabel: 'Enterprise Strategy',
    categoryIcon: Lightbulb,
    badgeColor: '#f59e0b',
    title: 'Unified ERP Truth',
    insight: 'When Admin, Client, and Developer share one single source of truth in real-time, project turnaround accelerates by 42% and status update friction drops to zero.',
    metric: '+42% Velocity'
  },
  {
    id: 2,
    category: 'admin',
    categoryLabel: 'Executive Command',
    categoryIcon: Shield,
    badgeColor: '#3b82f6',
    title: 'Preemptive Milestone Governance',
    insight: 'Live financial realization analytics and Atlas audit streams reveal bottlenecks before deadlines are compromised, protecting project profitability.',
    metric: '100% Audit Precision'
  },
  {
    id: 3,
    category: 'client',
    categoryLabel: 'Client Co-Creation',
    categoryIcon: Briefcase,
    badgeColor: '#10b981',
    title: 'Transparent Deliverable Portals',
    insight: 'Giving clients real-time visibility into active deliverables and 1-click invoice settlements builds 98% enterprise retention and unconditional trust.',
    metric: '98% Client Trust'
  },
  {
    id: 4,
    category: 'developer',
    categoryLabel: 'Developer Flow State',
    categoryIcon: Zap,
    badgeColor: '#8b5cf6',
    title: 'Uninterrupted Kanban Cadence',
    insight: 'Restricting developers from billing clutter while providing clear Kanban task acceptance states delivers 2.4x higher engineering velocity.',
    metric: '2.4x Engineering Output'
  },
  {
    id: 5,
    category: 'admin',
    categoryLabel: 'Financial Flow',
    categoryIcon: Shield,
    badgeColor: '#3b82f6',
    title: 'Accelerated Receivables Reconciliation',
    insight: 'Auto-generated itemized statements with digital receipt confirmation reduce outstanding invoicing cycles from weeks to hours.',
    metric: '3.5x Faster Cash Flow'
  },
  {
    id: 6,
    category: 'developer',
    categoryLabel: 'Cloud Performance',
    categoryIcon: Zap,
    badgeColor: '#8b5cf6',
    title: 'Sub-Millisecond Compound Indexing',
    insight: 'Targeted MongoDB compound B-tree indexes and debounced queries ensure the ERP stays responsive under thousands of concurrent task transitions.',
    metric: '< 1ms Query Speed'
  },
  {
    id: 7,
    category: 'client',
    categoryLabel: 'Self-Service Agility',
    categoryIcon: Briefcase,
    badgeColor: '#10b981',
    title: 'Instant 256-Bit Digital Billing',
    insight: 'Clients can review detailed itemized line items and execute instant encrypted payments directly without manual accounting back-and-forth.',
    metric: 'Instant Reconciliation'
  },
  {
    id: 8,
    category: 'general',
    categoryLabel: 'Portability Everywhere',
    categoryIcon: Lightbulb,
    badgeColor: '#f59e0b',
    title: 'Universal Multi-Device Fluidity',
    insight: 'An ERP that adapts seamlessly from 320px mobile smartphones to 4K executive command centers keeps teams productive anywhere in the world.',
    metric: 'Universal Responsive'
  }
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'admin' | 'client' | 'developer'>('all');
  const [activeIdeaIndex, setActiveIdeaIndex] = useState(0);
  const [sunbeamsEnabled, setSunbeamsEnabled] = useState(true);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsIdeasOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsIdeasOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredIdeas = BRIGHT_IDEAS.filter(idea => 
    selectedCategory === 'all' ? true : idea.category === selectedCategory
  );

  const currentIdea = filteredIdeas[activeIdeaIndex % filteredIdeas.length] || BRIGHT_IDEAS[0];

  const handleNextIdea = () => {
    setSparkleAnim(true);
    setTimeout(() => setSparkleAnim(false), 500);
    setActiveIdeaIndex(prev => (prev + 1) % filteredIdeas.length);
  };

  const isDark = theme === 'dark';

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
      background: isDark 
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
          opacity: isDark ? 0.35 : 1
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

        {/* Dynamic Animated Sunbeam Rays (Toggleable) */}
        {sunbeamsEnabled && (
          <g className="sunbeam-animated" style={{ opacity: isDark ? 0.18 : 0.45 }}>
            <polygon points="720,580 -200,-100 -100,-200" fill="#ffffff" />
            <polygon points="720,580 300,-300 450,-300" fill="#ffffff" />
            <polygon points="720,580 900,-300 1050,-300" fill="#ffffff" />
            <polygon points="720,580 1500,-100 1600,-50" fill="#ffffff" />
            <polygon points="720,580 1700,400 1700,550" fill="#ffffff" />
            <polygon points="720,580 1600,900 1500,1000" fill="#ffffff" />
            <polygon points="720,580 800,1200 650,1200" fill="#ffffff" />
            <polygon points="720,580 -100,800 -150,650" fill="#ffffff" />
          </g>
        )}

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

        {/* Left Side Pine Trees Group (With Organic Breeze Animation) */}
        <g className="pine-animated-left">
          {/* Tree 1 - Tall Pine */}
          <g transform="translate(130, 560)">
            <rect x="-6" y="140" width="12" height="35" fill="#451a03" />
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
        </g>

        {/* Right Side Pine Trees Group (With Organic Breeze Animation) */}
        <g className="pine-animated-right">
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
        </g>
      </svg>

      {/* Top Header Bar */}
      <header className="auth-header" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
        boxSizing: 'border-box'
      }}>
        
        {/* Top-Left: Modern Brand Mark & Logo (Exactly like video) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Dynamic Origami Emblem Icon */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '0px',
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
              color: isDark ? '#ffffff' : '#0f172a',
              textTransform: 'uppercase',
              lineHeight: 1.1
            }}>
              CLIENTFLOW
            </span>
            <span className="auth-brand-subtitle" style={{
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

        {/* Top-Right: Interactive "Bright Ideas / Illuminating Growth" System */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative' }}>
          
          {/* Interactive Floating "Bright Ideas" Widget with Alive Lightbulb Animation */}
          <div
            className="auth-bright-ideas-widget"
            onClick={() => setIsIdeasOpen(!isIdeasOpen)}
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isIdeasOpen 
                ? '1.5px solid #f59e0b'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.85)'),
              borderRadius: '0px',
              padding: '0.6rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: isIdeasOpen
                ? '0 10px 30px rgba(245, 158, 11, 0.35)'
                : '0 8px 24px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              userSelect: 'none'
            }}
            title="Click to illuminate Bright Ideas & Enterprise Innovation Insights"
          >
            {/* Glowing & Breathing Animated Lightbulb Avatar (From Your Picture) */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Concentric Pulsing Light Wave */}
              <span style={{
                position: 'absolute',
                inset: -5,
                borderRadius: '50%',
                border: '2px solid rgba(245, 158, 11, 0.7)',
                animation: 'bulbRingPulse 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                pointerEvents: 'none'
              }} />

              {/* Core Glowing Lightbulb Ball with Living Animation */}
              <div
                className="bulb-animated"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 60%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: '0 0 18px rgba(245, 158, 11, 0.65)'
                }}
              >
                <Lightbulb size={22} style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }} />
              </div>
            </div>

            <div className="auth-bright-ideas-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: isDark ? '#94a3b8' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                Enterprise Resource Planning
                <Sparkles size={11} style={{ color: '#f59e0b', animation: 'sparkRotate 4s linear infinite' }} />
              </span>
              <span style={{
                fontSize: '0.96rem',
                fontWeight: 800,
                color: isDark ? '#f8fafc' : '#0f172a',
                lineHeight: 1.1
              }}>
                Bright Ideas
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontStyle: 'italic',
                color: isDark ? '#fde047' : '#d97706',
                fontWeight: 600
              }}>
                Illuminating Growth • Click to Explore
              </span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '0.6rem',
              background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* =========================================================================
              INTERACTIVE "BRIGHT IDEAS" INNOVATION POPOVER (FUNCTIONALITY TO ANIMATION)
              ========================================================================= */}
          {isIdeasOpen && (
            <div
              ref={popoverRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 14px)',
                right: 0,
                width: 'min(440px, calc(100vw - 2rem))',
                background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                border: isDark ? '1.5px solid rgba(255, 255, 255, 0.15)' : '1.5px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '0px',
                padding: '1.5rem',
                boxShadow: isDark 
                  ? '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1) inset' 
                  : '0 25px 60px rgba(245, 158, 11, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
                zIndex: 100,
                animation: 'popoverEntrance 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.9)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '0px',
                    background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)'
                  }}>
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: isDark ? '#ffffff' : '#0f172a',
                      lineHeight: 1.2
                    }}>
                      Bright Ideas Hub
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Enterprise Architecture & Growth Principles
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsIdeasOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDark ? '#94a3b8' : '#64748b',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    borderRadius: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close ideas"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Role Category Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.35rem',
                padding: '0.9rem 0 0.75rem',
                overflowX: 'auto'
              }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'admin', label: '👑 Admin' },
                  { key: 'client', label: '💼 Client' },
                  { key: 'developer', label: '⚡ Developer' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedCategory(tab.key as any);
                      setActiveIdeaIndex(0);
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: 'none',
                      background: selectedCategory === tab.key
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                      color: selectedCategory === tab.key ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Bright Idea Card */}
              <div style={{
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(254, 243, 199, 0.45)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.35)',
                borderRadius: '0px',
                padding: '1.25rem',
                margin: '0.5rem 0 1rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                transform: sparkleAnim ? 'scale(0.98)' : 'scale(1)'
              }}>
                {/* Category & Metric Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: currentIdea.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <currentIdea.categoryIcon size={13} />
                    {currentIdea.categoryLabel}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: isDark ? '#fde047' : '#b45309',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0px'
                  }}>
                    {currentIdea.metric}
                  </span>
                </div>

                {/* Idea Title */}
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#1e1b4b'
                }}>
                  {currentIdea.title}
                </h4>

                {/* Insight Prose */}
                <p style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: isDark ? '#cbd5e1' : '#334155'
                }}>
                  "{currentIdea.insight}"
                </p>

                {/* Index Indicator */}
                <div style={{
                  marginTop: '0.85rem',
                  fontSize: '0.72rem',
                  color: isDark ? '#94a3b8' : '#78716c',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Idea {(activeIdeaIndex % filteredIdeas.length) + 1} of {filteredIdeas.length}</span>
                  <span style={{ display: 'flex', gap: '3px' }}>
                    {filteredIdeas.map((_, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: idx === (activeIdeaIndex % filteredIdeas.length) ? '12px' : '5px',
                          height: '5px',
                          borderRadius: '0px',
                          background: idx === (activeIdeaIndex % filteredIdeas.length) ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleNextIdea}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Shuffle size={15} />
                  <span>Spark Next Idea</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSunbeamsEnabled(!sunbeamsEnabled)}
                  style={{
                    padding: '0.75rem',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid',
                    borderColor: sunbeamsEnabled ? '#f59e0b' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    borderRadius: '0px',
                    color: sunbeamsEnabled ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                  title="Toggle dynamic sunbeam rays animation"
                >
                  <SunMedium size={16} />
                  <span>{sunbeamsEnabled ? 'Beams ON' : 'Beams OFF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Glassmorphism Form Card */}
      <div className="auth-card-container" style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        maxWidth: '280px',
        margin: 'auto',
        marginTop: '4.25rem',
        marginBottom: '1.5rem',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>

      {/* Bottom Subtitle / Watermark */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        fontSize: '0.78rem',
        color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.55)',
        textAlign: 'center',
        padding: '0.5rem 0'
      }}>
        &copy; {new Date().getFullYear()} ClientFlow Enterprise ERP • High Availability Cloud Platform
      </footer>
    </div>
  );
}
