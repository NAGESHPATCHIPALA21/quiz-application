import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export const Home = ({ onNavigate, onJoinWithCode, onOpenAuth }) => {
  const [pin, setPin] = useState('');
  const { user, isCreator, demoLogin } = useAuth();

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    sounds.playClick();
    onJoinWithCode(pin.trim().toUpperCase());
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '50px 0 60px',
        maxWidth: '850px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="badge badge-cyan pulse-glow">⚡ SOCKET.IO REAL-TIME ENGINE</span>
          <span className="badge badge-violet">MERN STACK</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
          lineHeight: '1.1',
          marginBottom: '20px',
          fontWeight: 900
        }}>
          Battle Brains in Real-Time <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-cyan), #a855f7, #f72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Multiplayer Quiz Arena
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Host live synchronized competitions, challenge friends with instant room PINs, 
          earn speed multipliers, and climb dynamic global leaderboards.
        </p>

        {/* Quick Join Game PIN Box */}
        <div className="glass-panel" style={{
          padding: '24px 30px',
          maxWidth: '480px',
          margin: '0 auto 50px',
          boxShadow: 'var(--shadow-glow-cyan)'
        }}>
          <form onSubmit={handleJoinSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="ENTER 6-DIGIT ROOM PIN"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ padding: '12px 24px', flexShrink: 0 }}
            >
              Join ➔
            </button>
          </form>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-faint)', marginTop: '10px' }}>
            No account required to join live rooms. Just enter the host PIN!
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          
          {/* Card 1: Host Room */}
          <div
            className="glass-panel glass-card-interactive"
            onClick={() => { sounds.playClick(); onNavigate('quizzes'); }}
            style={{ padding: '28px' }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '16px'
            }}>
              👑
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Host Multiplayer Room</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Launch a live synchronized game lobby with real-time timers, player sync, and podium finishes.
            </p>
          </div>

          {/* Card 2: Solo Practice */}
          <div
            className="glass-panel glass-card-interactive"
            onClick={() => { sounds.playClick(); onNavigate('quizzes'); }}
            style={{ padding: '28px' }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '16px'
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Solo Sprint Mode</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Test your mastery against the clock across History, Science, Cinema, and Full-Stack Engineering.
            </p>
          </div>

          {/* Card 3: Creator Studio */}
          <div
            className="glass-panel glass-card-interactive"
            onClick={() => {
              sounds.playClick();
              if (isCreator) {
                onNavigate('create');
              } else {
                onOpenAuth('register');
              }
            }}
            style={{ padding: '28px' }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(247, 37, 133, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '16px'
            }}>
              🛠️
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Quiz Creator Studio</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Design custom quizzes with time limits, custom point weights, categories, and explanations.
            </p>
          </div>

        </div>

      </div>

      {/* Feature Architecture Highlights Section */}
      <div className="glass-panel" style={{ padding: '40px', marginTop: '20px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', textAlign: 'center' }}>
          Full-Stack Platform Highlights
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '6px' }}>
              ⚡ Real-Time WebSockets
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5' }}>
              Bidirectional Socket.io rooms enable sub-50ms synchronized question countdowns, instant answer locks, and live round leaderboards.
            </p>
          </div>

          <div>
            <div style={{ color: 'var(--accent-fuchsia)', fontWeight: 700, marginBottom: '6px' }}>
              🛡️ Role-Based Access Control
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5' }}>
              Granular creator vs participant permissions, JWT token authorization, and guest-friendly join flows for frictionless play.
            </p>
          </div>

          <div>
            <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '6px' }}>
              📊 Dynamic Scoring Algorithm
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5' }}>
              Kahoot-style speed multiplier scoring combined with consecutive answer streak bonuses for exhilarating competitive gaming.
            </p>
          </div>

          <div>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '6px' }}>
              💾 Adaptive Storage Architecture
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5' }}>
              Seamlessly integrates MongoDB via Mongoose with automated standalone in-memory fallback for zero-configuration deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
