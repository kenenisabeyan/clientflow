import React, { useState } from 'react';

export interface UserAvatarProps {
  name?: string;
  avatar?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: string;
  borderColor?: string;
}

export default function UserAvatar({
  name = 'User',
  avatar,
  size = 36,
  className = '',
  style = {},
  fontSize,
  borderColor
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const calculatedFontSize = fontSize || `${Math.max(11, Math.round(size * 0.4))}px`;

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`profile-avatar user-profile-circle ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          aspectRatio: '1 / 1',
          flexShrink: 0,
          alignSelf: 'center',
          border: borderColor ? `2px solid ${borderColor}` : '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'inline-block',
          boxSizing: 'border-box',
          ...style
        }}
      />
    );
  }

  return (
    <div
      className={`profile-avatar user-profile-circle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
        borderRadius: '50%',
        aspectRatio: '1 / 1',
        flexShrink: 0,
        alignSelf: 'center',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: '#ffffff',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: calculatedFontSize,
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
        border: borderColor ? `2px solid ${borderColor}` : '1px solid rgba(255, 255, 255, 0.25)',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style
      }}
    >
      {initial}
    </div>
  );
}
