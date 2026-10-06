import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { sounds } from '../utils/sound';

const CATEGORIES = ['All', 'History', 'Science', 'Entertainment', 'Technology', 'General Knowledge'];

export const QuizList = ({ onSelectSolo, onSelectHost }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.getAll(selectedCategory, search);
      if (res.success) {
        setQuizzes(res.data);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuizzes();
  };

  return (
    <div className="container">
      {/* Title & Filter Bar */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Quiz Catalog</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Choose a challenge to play solo or host a live multiplayer room with your friends.
        </p>

        {/* Search & Filter Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="btn btn-sm"
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat);
                }}
                style={{
                  background: selectedCategory === cat ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '10px 16px' }}
            />
            <button type="submit" className="btn btn-outline btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No quizzes found</h3>
          <p style={{ marginTop: '8px' }}>Try switching category or search criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {quizzes.map((q) => (
            <div
              key={q._id}
              className="glass-panel pop-in"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-cyan">{q.category}</span>
                  <span className={`badge ${q.difficulty === 'Easy' ? 'badge-emerald' : (q.difficulty === 'Hard' ? 'badge-amber' : 'badge-violet')}`}>
                    {q.difficulty}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', lineHeight: '1.3' }}>
                  {q.title}
                </h3>
                
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {q.description || 'Interactive multi-choice quiz challenge.'}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  marginBottom: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-faint)'
                }}>
                  <span>📝 {q.questionCount} Questions</span>
                  <span>👤 {q.creatorName || 'Host'}</span>
                  <span>🎮 {q.playsCount || 0} plays</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectSolo(q._id);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    🎯 Solo Play
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectHost(q._id);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    👑 Host Room
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
