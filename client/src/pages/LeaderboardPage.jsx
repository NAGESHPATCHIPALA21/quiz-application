import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { sounds } from '../utils/sound';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.leaderboard.getGlobal(20);
      if (res.success) {
        setLeaderboard(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '8px' }}>GLOBAL RANKINGS</span>
          <h1 style={{ fontSize: '2.4rem' }}>V-Quiz Hall of Fame</h1>
          <p style={{ color: 'var(--text-muted)' }}>Top scorers across multiplayer rooms and solo challenges.</p>
        </div>

        <button
          onClick={() => { sounds.playClick(); fetchLeaderboard(); }}
          className="btn btn-outline btn-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏆</div>
          Calculating global rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No scores recorded yet</h3>
          <p style={{ marginTop: '8px' }}>Be the first to play and claim the #1 spot on the podium!</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.map((item, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={item._id || idx}
                  className="pop-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isFirst ? 'rgba(255, 215, 0, 0.08)' : (isSecond ? 'rgba(192, 192, 192, 0.06)' : (isThird ? 'rgba(205, 127, 50, 0.06)' : 'rgba(255, 255, 255, 0.02)')),
                    border: `1px solid ${isFirst ? 'rgba(255, 215, 0, 0.3)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      width: '32px',
                      color: isFirst ? '#ffd700' : (isSecond ? '#c0c0c0' : (isThird ? '#cd7f32' : 'var(--text-muted)'))
                    }}>
                      {isFirst ? '👑 1' : (isSecond ? '🥈 2' : (isThird ? '🥉 3' : `#${rank}`))}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.username}</span>
                        <span className={`badge ${item.mode === 'multiplayer' ? 'badge-violet' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                          {item.mode || 'multiplayer'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                        {item.quizTitle} • Accuracy: {item.accuracy}% ({item.correctAnswers}/{item.totalQuestions})
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    color: isFirst ? '#ffd700' : 'var(--accent-cyan)'
                  }}>
                    {item.score.toLocaleString()} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
