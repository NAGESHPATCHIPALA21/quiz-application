import React, { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export const QuizCreate = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      timeLimit: 20,
      points: 1000,
      explanation: ''
    }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    sounds.playClick();
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        timeLimit: 20,
        points: 1000,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    sounds.playClick();
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    const prevOpt = updated[qIdx].options[optIdx];
    updated[qIdx].options[optIdx] = value;

    // If this option was selected as correct answer, keep correct answer updated
    if (updated[qIdx].correctAnswer === prevOpt) {
      updated[qIdx].correctAnswer = value;
    }
    setQuestions(updated);
  };

  const handleSetCorrectAnswer = (qIdx, optValue) => {
    sounds.playClick();
    const updated = [...questions];
    updated[qIdx].correctAnswer = optValue;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} prompt cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${j + 1} cannot be empty.`);
          return;
        }
      }
      if (!q.correctAnswer) {
        setError(`Please mark a correct answer for Question #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    sounds.playClick();

    try {
      const res = await api.quizzes.create({
        title,
        description,
        category,
        difficulty,
        questions
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to create quiz.');
      }
    } catch (err) {
      setError('Server error creating quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <span className="badge badge-fuchsia" style={{ marginBottom: '8px' }}>CREATOR STUDIO</span>
            <h1 style={{ fontSize: '2.2rem' }}>Build New Quiz</h1>
          </div>
          <button onClick={onCancel} className="btn btn-outline btn-sm">
            Cancel
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Metadata Section */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '32px',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Quiz Overview</h3>
            
            <div className="form-group">
              <label className="form-label">Quiz Title</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Modern Full-Stack Web Development Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Subtitle</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Brief summary of what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="History">History</option>
                  <option value="Science">Science</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Question Builder */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Questions ({questions.length})</h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddQuestion}
              >
                + Add Another Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="pop-in"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="badge badge-cyan">Question #{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-crimson)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      🗑️ Delete Question
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Enter the question prompt here..."
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                  />
                </div>

                {/* Options */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">
                    Answer Options (Click checkmark to set correct answer)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer && q.correctAnswer === opt;
                      return (
                        <div
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectAnswer(qIdx, opt)}
                            style={{
                              background: isCorrect ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                              color: isCorrect ? '#000' : '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            title="Set as correct answer"
                          >
                            {isCorrect ? '✓' : String.fromCharCode(65 + optIdx)}
                          </button>
                          <input
                            type="text"
                            className="form-input"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '8px 0' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time & Points & Explanation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Timer Limit</label>
                    <select
                      className="form-select"
                      value={q.timeLimit}
                      onChange={(e) => handleQuestionChange(qIdx, 'timeLimit', Number(e.target.value))}
                    >
                      <option value={10}>10 Seconds (Speed)</option>
                      <option value={15}>15 Seconds</option>
                      <option value={20}>20 Seconds (Standard)</option>
                      <option value={30}>30 Seconds (Thoughtful)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Base Points</label>
                    <select
                      className="form-select"
                      value={q.points}
                      onChange={(e) => handleQuestionChange(qIdx, 'points', Number(e.target.value))}
                    >
                      <option value={1000}>1000 Points (Standard)</option>
                      <option value={2000}>2000 Points (Double Power)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Explanation / Fun Fact (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short explanation revealed after the question..."
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                  />
                </div>

              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Publishing...' : '🚀 Publish Quiz to Platform'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
