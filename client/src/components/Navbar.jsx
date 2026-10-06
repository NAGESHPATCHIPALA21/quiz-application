import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/sound';

export const Navbar = ({ activeView, setActiveView, onOpenAuth }) => {
  const { user, logout, isCreator, demoLogin } = useAuth();
  const { connected } = useSocket();

  const handleNav = (view) => {
    sounds.playClick();
    setActiveView(view);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: 'rgba(7, 9, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => handleNav('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            ⚡
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 40%, var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              V-QUIZ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-4px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: connected ? '#10b981' : '#ef4444',
                boxShadow: connected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
              }}></span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {connected ? 'LIVE ENGINE' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${activeView === 'home' ? 'btn-outline' : ''}`}
            onClick={() => handleNav('home')}
            style={{ 
              background: activeView === 'home' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeView === 'home' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            Home
          </button>
          <button 
            className={`btn btn-sm`}
            onClick={() => handleNav('quizzes')}
            style={{ 
              background: activeView === 'quizzes' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeView === 'quizzes' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            Quizzes
          </button>
          <button 
            className={`btn btn-sm`}
            onClick={() => handleNav('join')}
            style={{ 
              background: activeView === 'join' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeView === 'join' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            Join Room
          </button>
          <button 
            className={`btn btn-sm`}
            onClick={() => handleNav('leaderboard')}
            style={{ 
              background: activeView === 'leaderboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeView === 'leaderboard' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            Leaderboard
          </button>
          
          {isCreator && (
            <button 
              className={`btn btn-sm`}
              onClick={() => handleNav('create')}
              style={{ 
                background: activeView === 'create' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'create' ? 'var(--accent-fuchsia)' : 'var(--text-muted)'
              }}
            >
              + Create Quiz
            </button>
          )}
        </div>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1rem' }}>{user.role === 'creator' ? '👑' : '🎮'}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user.username}</div>
                  <div style={{ fontSize: '0.68rem', color: user.role === 'creator' ? 'var(--accent-cyan)' : 'var(--accent-emerald)', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={logout}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onOpenAuth('login')}
              >
                Log In
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('register')}
              >
                Sign Up
              </button>
              <button
                className="btn btn-sm"
                onClick={async () => {
                  sounds.playClick();
                  await demoLogin('creator');
                }}
                style={{
                  background: 'rgba(138, 43, 226, 0.2)',
                  border: '1px solid rgba(138, 43, 226, 0.4)',
                  color: '#d8b4fe',
                  fontSize: '0.78rem',
                  padding: '6px 10px'
                }}
                title="Log in instantly as Demo Quiz Creator"
              >
                ⚡ Demo Host
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
