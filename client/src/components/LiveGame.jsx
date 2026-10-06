import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/sound';

const OPTION_STYLES = [
  { color: 'red', shape: '▲', label: 'A' },
  { color: 'blue', shape: '◆', label: 'B' },
  { color: 'yellow', shape: '●', label: 'C' },
  { color: 'green', shape: '■', label: 'D' }
];

export const LiveGame = ({
  isHost,
  questionData,
  timeLeft,
  roundResult,
  answeredCount = 0,
  totalPlayers = 0,
  myPlayer,
  onNextQuestion
}) => {
  const { socket } = useSocket();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset state on new question
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
  }, [questionData?.questionIndex]);

  // Audio cues for countdown
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !roundResult) {
      sounds.playTick();
    }
  }, [timeLeft, roundResult]);

  // Audio for result reveal
  useEffect(() => {
    if (roundResult) {
      if (myPlayer) {
        const me = roundResult.leaderboard?.find(p => p.id === myPlayer.id);
        if (me?.isCorrect) {
          sounds.playCorrect();
        } else {
          sounds.playWrong();
        }
      }
    }
  }, [roundResult]);

  const handleSelectAnswer = (option) => {
    if (hasSubmitted || roundResult || isHost) return;

    sounds.playClick();
    setSelectedOption(option);
    setHasSubmitted(true);

    socket.emit('player:submit-answer', { answer: option });
  };

  if (!questionData) return null;

  const { questionIndex, totalQuestions, question, options, timeLimit } = questionData;
  const progressPercent = ((questionIndex + 1) / totalQuestions) * 100;
  const timerPercent = Math.max(0, (timeLeft / (timeLimit || 20)) * 100);

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      
      {/* Top Header: Progress, Question Counter, Live Timer */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-cyan">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            {isHost && (
              <span className="badge badge-violet">
                Answers: {answeredCount} / {totalPlayers}
              </span>
            )}
          </div>

          {/* Synchronized Countdown Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: timeLeft <= 5 ? 'var(--accent-crimson)' : 'var(--accent-cyan)'
          }}>
            <span style={{ fontSize: '1.1rem' }}>⏱️</span>
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div style={{
          height: '6px',
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${timerPercent}%`,
            background: timeLeft <= 5 ? 'var(--accent-crimson)' : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
            transition: 'width 1s linear'
          }}></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{
        padding: '36px 32px',
        textAlign: 'center',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-card), 0 0 40px rgba(0, 242, 254, 0.08)'
      }}>
        <h2 style={{
          fontSize: '1.85rem',
          lineHeight: '1.35',
          fontWeight: 700,
          color: '#ffffff'
        }}>
          {question}
        </h2>
      </div>

      {/* 4 Interactive Answer Cards */}
      <div className="answer-grid" style={{ marginBottom: '28px' }}>
        {options.map((opt, idx) => {
          const style = OPTION_STYLES[idx % OPTION_STYLES.length];
          const isSelected = selectedOption === opt;
          const isCorrectAnswer = roundResult && roundResult.correctAnswer === opt;
          const isWrongSelected = roundResult && isSelected && !isCorrectAnswer;

          let extraClass = '';
          if (isSelected) extraClass += ' selected';
          if (roundResult) {
            if (isCorrectAnswer) extraClass += ' correct';
            else extraClass += ' wrong';
          }

          return (
            <button
              key={idx}
              className={`answer-card ${style.color} ${extraClass}`}
              onClick={() => handleSelectAnswer(opt)}
              disabled={hasSubmitted || !!roundResult || isHost}
              style={{
                opacity: (isHost || (hasSubmitted && !isSelected && !roundResult)) ? 0.75 : 1
              }}
            >
              <div className="answer-badge">
                {style.shape}
              </div>
              <span style={{ flex: 1 }}>{opt}</span>

              {/* Reveal distribution badge if round ended */}
              {roundResult?.distribution && (
                <span style={{
                  fontSize: '0.85rem',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600
                }}>
                  {roundResult.distribution[opt] || 0} votes
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Round Reveal & Leaderboard Section */}
      {roundResult ? (
        <div className="glass-panel pop-in" style={{ padding: '28px', marginBottom: '24px' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>ROUND CONCLUDED</span>
              <h3 style={{ fontSize: '1.3rem' }}>
                Correct Answer: <strong style={{ color: 'var(--accent-emerald)' }}>{roundResult.correctAnswer}</strong>
              </h3>
              {roundResult.explanation && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  💡 {roundResult.explanation}
                </p>
              )}
            </div>

            {/* Host Controls */}
            {isHost && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onNextQuestion();
                }}
                className="btn btn-primary btn-lg pulse-glow"
              >
                {roundResult.isLastQuestion ? '🏆 View Final Podium' : 'Next Question ➔'}
              </button>
            )}
          </div>

          {/* Round Standings */}
          <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Current Room Standings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roundResult.leaderboard?.slice(0, 5).map((player) => {
              const isMe = myPlayer && myPlayer.id === player.id;
              return (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isMe ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isMe ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      width: '24px',
                      color: player.rank === 1 ? '#ffd700' : (player.rank === 2 ? '#c0c0c0' : (player.rank === 3 ? '#cd7f32' : 'var(--text-muted)'))
                    }}>
                      #{player.rank}
                    </span>
                    <span style={{ fontSize: '1.3rem' }}>{player.avatar || '⚡'}</span>
                    <div>
                      <span style={{ fontWeight: 700 }}>{player.username}</span>
                      {player.streak > 1 && (
                        <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                          🔥 {player.streak} Streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {player.lastPointsGained > 0 && (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 700 }}>
                        +{player.lastPointsGained}
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {player.score.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Status during active question */
        !isHost && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {hasSubmitted ? (
              <div className="badge badge-emerald" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                ✓ Answer Submitted! Waiting for other players or timer...
              </div>
            ) : (
              <span>⚡ Click fast! Faster correct answers earn maximum points.</span>
            )}
          </div>
        )
      )}

    </div>
  );
};
