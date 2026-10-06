import React, { useEffect } from 'react';
import { triggerConfetti } from './Confetti';
import { sounds } from '../utils/sound';

export const Podium = ({ podium, rankings = [], quizTitle, onPlayAgain, onBackHome }) => {
  useEffect(() => {
    triggerConfetti();
    sounds.playFanfare();
    const interval = setTimeout(() => {
      triggerConfetti();
    }, 1500);
    return () => clearTimeout(interval);
  }, []);

  const first = podium?.first;
  const second = podium?.second;
  const third = podium?.third;

  return (
    <div className="container" style={{ maxWidth: '850px', textAlign: 'center' }}>
      <div className="glass-panel pop-in" style={{ padding: '40px 24px', boxShadow: '0 0 50px rgba(0, 242, 254, 0.2)' }}>
        
        <span className="badge badge-amber" style={{ marginBottom: '12px' }}>
          MATCH FINALE
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Victory Podium</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          {quizTitle || 'Multiplayer Championship'}
        </p>

        {/* 3-Step Podium Display */}
        <div className="podium-container">
          
          {/* 2nd Place */}
          {second && (
            <div className="podium-step podium-2nd pop-in" style={{ animationDelay: '0.2s' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🥈</div>
              <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{second.avatar || '⚡'}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{second.username}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {second.score.toLocaleString()} pts
              </div>
              <div className="podium-pillar">
                <span style={{ fontSize: '2rem' }}>2</span>
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {first && (
            <div className="podium-step podium-1st pop-in" style={{ animationDelay: '0.4s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>👑</div>
              <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>{first.avatar || '⚡'}</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffd700', marginBottom: '2px' }}>
                {first.username}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ffecb3', fontWeight: 700, marginBottom: '8px' }}>
                {first.score.toLocaleString()} pts
              </div>
              <div className="podium-pillar">
                <span style={{ fontSize: '2.8rem' }}>1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="podium-step podium-3rd pop-in" style={{ animationDelay: '0.6s' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🥉</div>
              <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{third.avatar || '⚡'}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{third.username}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {third.score.toLocaleString()} pts
              </div>
              <div className="podium-pillar">
                <span style={{ fontSize: '1.6rem' }}>3</span>
              </div>
            </div>
          )}

        </div>

        {/* Detailed Player Standings Table */}
        <div style={{ marginTop: '40px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Final Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rankings.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, width: '24px' }}>
                    #{p.rank || idx + 1}
                  </span>
                  <span style={{ fontSize: '1.4rem' }}>{p.avatar || '⚡'}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                      Accuracy: {p.accuracy}% ({p.correctCount} correct)
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                  {p.score.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '36px' }}>
          <button
            onClick={() => {
              sounds.playClick();
              onBackHome();
            }}
            className="btn btn-outline"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="btn btn-primary btn-lg"
          >
            Play Another Quiz ➔
          </button>
        </div>

      </div>
    </div>
  );
};
