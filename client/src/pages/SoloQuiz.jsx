import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';
import { triggerConfetti } from '../components/Confetti';

const OPTION_STYLES = [
  { color: 'red', shape: '▲' },
  { color: 'blue', shape: '◆' },
  { color: 'yellow', shape: '●' },
  { color: 'green', shape: '■' }
];

const shuffleOptions = (options) => {
  if (!Array.isArray(options)) return [];
  const shuffled = [...options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export const SoloQuiz = ({ quizId, onExit, onPlayAgain }) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // Load Quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.quizzes.getById(quizId);
        if (res.success && res.data) {
        const loadedQuiz = res.data;

          setQuiz(loadedQuiz);

          setShuffledQuestions(
            Object.fromEntries(
              loadedQuiz.questions.map((question, index) => [
        index,
                shuffleOptions(question.options)
      ])
    )
  );

  setTimeLeft(loadedQuiz.questions[0]?.timeLimit || 20);
}
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Question Timer
  useEffect(() => {
    if (!quiz || isAnswered || isCompleted) return;

    if (timeLeft <= 0) {
      handleTimeExpired();
      return;
    }

    if (timeLeft <= 5) {
      sounds.playTick();
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isCompleted, quiz]);

  const handleTimeExpired = () => {
    sounds.playWrong();
    setIsAnswered(true);
    setSelectedAnswer(null);
    setStreak(0);

    const updatedAnswers = [...userAnswers, null];
    setUserAnswers(updatedAnswers);
  };

  const handleSelectAnswer = (option) => {
    if (isAnswered || isCompleted) return;

    sounds.playClick();
    setSelectedAnswer(option);
    setIsAnswered(true);

    const q = quiz.questions[currentIndex];
    const isCorrect = option === q.correctAnswer;

    if (isCorrect) {
      sounds.playCorrect();
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      const speedMultiplier = Math.max(0.5, timeLeft / (q.timeLimit || 20));
      const streakBonus = Math.min(currentStreak * 50, 250);
      const pointsEarned = Math.round((q.points || 1000) * speedMultiplier + streakBonus);
      setScore(prev => prev + pointsEarned);
    } else {
      sounds.playWrong();
      setStreak(0);
    }

    const updatedAnswers = [...userAnswers, option];
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = async () => {
    sounds.playClick();
    if (currentIndex + 1 < quiz.questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(quiz.questions[nextIdx]?.timeLimit || 20);
    } else {
      // Quiz completed! Submit to API
      setIsCompleted(true);
      try {
        const res = await api.quizzes.submitSolo(
          quiz._id,
          userAnswers,
          user?.username || 'Guest Player'
        );
        if (res.success) {
          setFinalResult(res.data);
          if (res.data.accuracy >= 70) {
            triggerConfetti();
            sounds.playFanfare();
          }
        }
      } catch (err) {
        console.error('Submission error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
        <h2>Loading Solo Challenge...</h2>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Quiz not found</h2>
        <button onClick={onExit} className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const totalQ = quiz.questions.length;
  const timerPercent = Math.max(0, (timeLeft / (currentQ?.timeLimit || 20)) * 100);

  // SUMMARY SCREEN
  if (isCompleted && finalResult) {
    return (
      <div className="container" style={{ maxWidth: '750px' }}>
        <div className="glass-panel pop-in" style={{ padding: '40px', textAlign: 'center' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>CHALLENGE COMPLETED</span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Here is your performance breakdown</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '36px'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Total Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {finalResult.score.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Correct Answers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {finalResult.correctAnswers} / {finalResult.totalQuestions}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Accuracy</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {finalResult.accuracy}%
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div style={{ textAlign: 'left', marginBottom: '36px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-muted)' }}>
              Detailed Question Review
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {finalResult.answerBreakdown?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: item.isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>Q{idx + 1}: {item.question}</strong>
                    <span>{item.isCorrect ? '✅ Correct' : '❌ Missed'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Your answer: <span style={{ color: item.isCorrect ? '#34d399' : '#f87171' }}>{item.userAnswer}</span> | Correct: <strong style={{ color: '#34d399' }}>{item.correctAnswer}</strong>
                  </div>
                  {item.explanation && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                      💡 {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={onExit} className="btn btn-outline">
              Exit to Catalog
            </button>
            <button onClick={onPlayAgain} className="btn btn-primary btn-lg">
              Retry This Quiz ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ INTERFACE
  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-cyan">Question {currentIndex + 1} of {totalQ}</span>
            <span className="badge badge-violet">{quiz.category}</span>
            {streak > 1 && (
              <span className="badge badge-amber">🔥 {streak} Streak!</span>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.2rem',
            fontWeight: 800
          }}>
            <span style={{ color: 'var(--accent-emerald)' }}>{score.toLocaleString()} pts</span>
            <span style={{ color: timeLeft <= 5 ? 'var(--accent-crimson)' : 'var(--accent-cyan)' }}>
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Bar */}
        <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${timerPercent}%`,
            background: timeLeft <= 5 ? 'var(--accent-crimson)' : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
            transition: 'width 1s linear'
          }}></div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="glass-panel" style={{ padding: '36px 30px', textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', lineHeight: '1.35', fontWeight: 700 }}>
          {currentQ.question}
        </h2>
      </div>

      {/* Answer Cards */}
      <div className="answer-grid" style={{ marginBottom: '28px' }}>
        {(shuffledQuestions[currentIndex] || currentQ.options).map((opt, idx) => {
          const style = OPTION_STYLES[idx % OPTION_STYLES.length];
          const isSelected = selectedAnswer === opt;
          const isCorrect = isAnswered && opt === currentQ.correctAnswer;
          const isWrong = isAnswered && isSelected && !isCorrect;

          let extraClass = '';
          if (isSelected) extraClass += ' selected';
          if (isAnswered) {
            if (isCorrect) extraClass += ' correct';
            else extraClass += ' wrong';
          }

          return (
            <button
              key={idx}
              className={`answer-card ${style.color} ${extraClass}`}
              onClick={() => handleSelectAnswer(opt)}
              disabled={isAnswered}
            >
              <div className="answer-badge">{style.shape}</div>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Post-Answer Feedback & Next Button */}
      {isAnswered && (
        <div className="glass-panel pop-in" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: selectedAnswer === currentQ.correctAnswer ? 'var(--accent-emerald)' : 'var(--accent-crimson)' }}>
              {selectedAnswer === currentQ.correctAnswer ? '🎉 Correct Answer!' : `❌ Incorrect! Answer was: ${currentQ.correctAnswer}`}
            </div>
            {currentQ.explanation && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                💡 {currentQ.explanation}
              </div>
            )}
          </div>

          <button onClick={handleNextQuestion} className="btn btn-primary btn-lg pulse-glow">
            {currentIndex + 1 < totalQ ? 'Next Question ➔' : 'Complete Challenge ➔'}
          </button>
        </div>
      )}

    </div>
  );
};
