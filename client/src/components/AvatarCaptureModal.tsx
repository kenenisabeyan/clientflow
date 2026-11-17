import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Check, Trash2, SwitchCamera, AlertCircle, Sparkles } from 'lucide-react';

interface AvatarCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (base64Image: string) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  currentAvatar?: string | null;
  userName?: string;
}

export default function AvatarCaptureModal({
  isOpen,
  onClose,
  onSave,
  onRemove,
  currentAvatar,
  userName = 'User'
}: AvatarCaptureModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputFallbackRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream utility
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Check for multiple cameras
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Handle switching to camera tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !previewImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, previewImage]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewImage(null);
      setCameraError(null);
      setActiveTab('upload');
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // Start live webcam stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this browser. Use local storage or mobile photo options.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'Could not access camera. Please allow camera permissions in your browser or choose a photo from files.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in browser site settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Flip front/back camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Crop & compress image on canvas to square 1:1 max 400x400
  const processImageToSquareBase64 = (imgSource: HTMLImageElement | HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    if (!ctx) return '';

    const srcWidth = 'videoWidth' in imgSource ? imgSource.videoWidth : imgSource.naturalWidth;
    const srcHeight = 'videoHeight' in imgSource ? imgSource.videoHeight : imgSource.naturalHeight;

    const minDim = Math.min(srcWidth, srcHeight);
    const startX = (srcWidth - minDim) / 2;
    const startY = (srcHeight - minDim) / 2;

    // Draw square cropped to center
    ctx.drawImage(
      imgSource,
      startX,
      startY,
      minDim,
      minDim,
      0,
      0,
      targetSize,
      targetSize
    );

    return canvas.toDataURL('image/jpeg', 0.88);
  };

  // Take photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !isCameraActive) return;
    try {
      const base64 = processImageToSquareBase64(videoRef.current);
      if (base64) {
        setPreviewImage(base64);
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    }
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const squareBase64 = processImageToSquareBase64(img);
        setPreviewImage(squareBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save the selected or captured image
  const handleSave = async () => {
    if (!previewImage) return;
    setSaving(true);
    try {
      await onSave(previewImage);
      onClose();
    } catch (err) {
      console.error('Failed to save avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  // Remove existing avatar
  const handleRemove = async () => {
    if (!onRemove) return;
    if (window.confirm('Are you sure you want to remove your custom profile photo?')) {
      setSaving(true);
      try {
        await onRemove();
        onClose();
      } catch (err) {
        console.error('Failed to remove avatar:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Profile Photo Studio
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Take photo from camera or upload from device
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        {!previewImage && (
          <div
            style={{
              display: 'flex',
              padding: '0.75rem 1.5rem 0',
              gap: '0.5rem',
              borderBottom: '1px solid var(--surface-border)'
            }}
          >
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: activeTab === 'upload' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'upload' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Upload size={16} /> Device Storage
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: activeTab === 'camera' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'camera' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Camera size={16} /> Take Live Photo
            </button>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* PREVIEW MODE (When user snapped or picked an image) */}
          {previewImage ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="profile-avatar"
                  style={{
                    width: '180px',
                    height: '180px',
                    minWidth: '180px',
                    minHeight: '180px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    aspectRatio: '1 / 1',
                    border: '4px solid var(--primary)',
                    boxShadow: '0 12px 28px rgba(59, 130, 246, 0.35)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: '#10b981',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  <Check size={16} />
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>
                  Perfect Circular Crop
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  This photo will be displayed across your profile, topbar, and team channels.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '1px solid var(--surface-border)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RefreshCw size={15} /> Retake / Choose Other
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  {saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Apply Photo'}
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* CAMERA MODE */
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {cameraError ? (
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%'
                  }}
                >
                  <AlertCircle size={32} style={{ color: '#ef4444' }} />
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)' }}>{cameraError}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={startCamera}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid var(--surface-border)',
                        background: 'var(--surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => cameraInputFallbackRef.current?.click()}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Open Mobile Camera App
                    </button>
                    <input
                      ref={cameraInputFallbackRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  {/* Viewfinder with circular guide */}
                  <div
                    style={{
                      position: 'relative',
                      width: '260px',
                      height: '260px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid var(--primary)',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                      background: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                      }}
                    />
                    {!isCameraActive && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          background: 'rgba(0,0,0,0.6)',
                          gap: '0.5rem'
                        }}
                      >
                        <RefreshCw size={24} className="animate-spin" />
                        <span style={{ fontSize: '0.82rem' }}>Starting camera...</span>
                      </div>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Position your face within the circle, then click Snap Photo.
                  </p>

                  {/* Camera Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    {hasMultipleCameras && (
                      <button
                        onClick={handleToggleCamera}
                        title="Flip Camera"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: '1px solid var(--surface-border)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <SwitchCamera size={18} />
                      </button>
                    )}

                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraActive}
                      style={{
                        padding: '0.75rem 1.8rem',
                        borderRadius: '30px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: isCameraActive ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <Camera size={18} /> Snap Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* UPLOAD / LOCAL STORAGE MODE */
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                  e.currentTarget.style.background = 'transparent';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                  e.currentTarget.style.background = 'transparent';
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = new Image();
                      img.onload = () => {
                        const square = processImageToSquareBase64(img);
                        setPreviewImage(square);
                      };
                      img.src = ev.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '2.5rem 1.5rem',
                  border: '2px dashed var(--surface-border)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-color)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Upload size={28} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', display: 'block' }}>
                    Choose image from your device
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, GIF or WebP (Drag & drop here)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px'
                  }}
                >
                  Browse Files
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {/* Current avatar preview & delete option */}
              {currentAvatar && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={currentAvatar}
                      alt="Current Avatar"
                      className="profile-avatar"
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        minHeight: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                        Custom Photo Active
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Revert to initial circle avatar
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemove}
                    disabled={saving}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
