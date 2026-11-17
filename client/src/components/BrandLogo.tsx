import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  rotate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandIcon: React.FC<{ size?: number; rotate?: boolean; style?: React.CSSProperties }> = ({
  size = 38,
  rotate = true,
  style = {}
}) => {
  const iconPixel = Math.round(size * 0.58);
  return (
    <div
      className="auth-logo-icon"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '0px',
        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
        transform: rotate ? 'rotate(-4deg)' : 'none',
        flexShrink: 0,
        ...style
      }}
    >
      <svg width={iconPixel} height={iconPixel} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 9L12 16L21 9L12 2Z" fill="#ffffff" fillOpacity="0.9" />
        <path d="M3 9L12 16V22L3 15V9Z" fill="#ffffff" fillOpacity="0.7" />
        <path d="M21 9L12 16V22L21 15V9Z" fill="#ffffff" fillOpacity="0.5" />
      </svg>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'ENTERPRISE PLATFORM',
  rotate = true,
  className = '',
  style = {}
}) => {
  const dims = {
    sm: { icon: 28, titleSize: '1.05rem', subSize: '0.55rem', gap: '0.55rem' },
    md: { icon: 36, titleSize: '1.25rem', subSize: '0.62rem', gap: '0.75rem' },
    lg: { icon: 42, titleSize: '1.45rem', subSize: '0.70rem', gap: '0.85rem' },
  }[size];

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: dims.gap,
        ...style
      }}
    >
      <BrandIcon size={dims.icon} rotate={rotate} />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            className="brand-logo-title"
            style={{
              fontSize: dims.titleSize,
              fontWeight: 800,
              letterSpacing: '1.2px',
              color: 'var(--text-main, #0f172a)',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              whiteSpace: 'nowrap'
            }}
          >
            CLIENTFLOW
          </span>
          {subtitle && (
            <span
              className="brand-logo-subtitle"
              style={{
                fontSize: dims.subSize,
                fontWeight: 700,
                letterSpacing: '1.2px',
                color: '#0284c7',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
