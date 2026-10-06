import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('creator'); // 'creator' or 'participant'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    sounds.playClick();

    if (mode === 'login') {
      const res = await login(emailOrUsername, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    } else {
      const res = await register(username, email, password, role);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  const handleDemo = async (roleChoice) => {
    sounds.playClick();
    setLoading(true);
    const res = await demoLogin(roleChoice);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel pop-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.15)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              background: mode === 'login' ? 'var(--bg-card-hover)' : 'transparent',
              color: mode === 'login' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: mode === 'login' ? '1px solid var(--border-glow)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              background: mode === 'register' ? 'var(--bg-card-hover)' : 'transparent',
              color: mode === 'register' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: mode === 'register' ? '1px solid var(--border-glow)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome Back to V-Quiz' : 'Join V-Quiz Platform'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '24px' }}>
          {mode === 'login' 
            ? 'Sign in to access your hosted rooms, quizzes, and live standings' 
            : 'Select your role to start hosting or competing'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    onClick={() => setRole('creator')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: role === 'creator' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${role === 'creator' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.4rem' }}>👑</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>Quiz Creator</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Build & Host Rooms</div>
                  </div>

                  <div
                    onClick={() => setRole('participant')}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: role === 'participant' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${role === 'participant' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.4rem' }}>🎮</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>Participant</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Join & Compete</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. MasterCoder"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="creator@vquiz.dev or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center', marginBottom: '10px' }}>
            OR TEST INSTANTLY WITH ONE CLICK:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemo('creator')}
              style={{ fontSize: '0.78rem' }}
            >
              👑 Demo Creator
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemo('participant')}
              style={{ fontSize: '0.78rem' }}
            >
              🎮 Demo Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
