import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { RoomLobby } from '../components/RoomLobby';
import { LiveGame } from '../components/LiveGame';
import { Podium } from '../components/Podium';
import { sounds } from '../utils/sound';

const AVATARS = ['⚡', '🚀', '🔥', '👾', '🦊', '🐯', '🐼', '🦄', '🎯', '💎', '👑', '🧙'];

export const MultiplayerRoom = ({
  initialCode = '',
  hostQuizId = null,
  onExit
}) => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  // Room State
  const [roomCode, setRoomCode] = useState(initialCode);
  const [isHost, setIsHost] = useState(!!hostQuizId);
  const [gameState, setGameState] = useState(hostQuizId || initialCode ? 'JOINING' : 'ENTER_PIN');
  // 'ENTER_PIN' | 'JOINING' | 'LOBBY' | 'STARTING' | 'QUESTION' | 'REVEAL' | 'FINISHED'

  // Metadata
  const [quizInfo, setQuizInfo] = useState({ title: '', category: '', totalQuestions: 0 });
  const [players, setPlayers] = useState([]);
  const [myPlayer, setMyPlayer] = useState(null);

  // Active Question
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [roundResult, setRoundResult] = useState(null);

  // Finale
  const [finalData, setFinalData] = useState(null);

  // Form State for Join PIN
  const [inputPin, setInputPin] = useState(initialCode);
  const [inputNickname, setInputNickname] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState('⚡');
  const [errorMessage, setErrorMessage] = useState('');

  // -------------------------------------------------------------
  // SOCKET LISTENERS SETUP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // 1. Host Room Created
    socket.on('room:created', (data) => {
      setRoomCode(data.roomCode);
      setQuizInfo({
        title: data.quizTitle,
        category: data.category,
        totalQuestions: data.totalQuestions
      });
      setIsHost(true);
      setGameState('LOBBY');
    });

    // 2. Player Joined Room
    socket.on('room:joined', (data) => {
      setRoomCode(data.roomCode);
      setQuizInfo({
        title: data.quizTitle,
        category: data.category,
        totalQuestions: data.totalQuestions
      });
      setMyPlayer(data.player);
      setIsHost(false);
      setGameState('LOBBY');
    });

    // 3. Players List Updated
    socket.on('room:players-updated', (data) => {
      setPlayers(data.players);
    });

    // 4. Game Starting Countdown
    socket.on('game:starting', () => {
      setGameState('STARTING');
      sounds.playCountdownBeep(true);
    });

    // 5. New Question Dispatched
    socket.on('game:new-question', (questionPayload) => {
      setCurrentQuestion(questionPayload);
      setTimeLeft(questionPayload.timeLimit || 20);
      setRoundResult(null);
      setAnsweredCount(0);
      setGameState('QUESTION');
    });

    // 6. Synchronized Timer Tick
    socket.on('game:timer-tick', ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    // 7. Answer Progress update for host
    socket.on('game:answer-progress', ({ answeredCount }) => {
      setAnsweredCount(answeredCount);
    });

    // 8. Question Concluded & Result Revealed
    socket.on('game:question-revealed', (resultData) => {
      setRoundResult(resultData);
      setGameState('REVEAL');
    });

    // 9. Game Over / Podium
    socket.on('game:over', (gameOverData) => {
      setFinalData(gameOverData);
      setGameState('FINISHED');
    });

    // Error Handlers
    socket.on('error:join', ({ message }) => {
      setErrorMessage(message);
      setGameState('ENTER_PIN');
    });

    socket.on('error:room', ({ message }) => {
      setErrorMessage(message);
      setGameState('ENTER_PIN');
    });

    socket.on('room:closed', ({ message }) => {
      alert(message || 'The room was closed by the host.');
      onExit();
    });

    return () => {
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:players-updated');
      socket.off('game:starting');
      socket.off('game:new-question');
      socket.off('game:timer-tick');
      socket.off('game:answer-progress');
      socket.off('game:question-revealed');
      socket.off('game:over');
      socket.off('error:join');
      socket.off('error:room');
      socket.off('room:closed');
    };
  }, [socket]);

  // Host Initial Creation Trigger
  useEffect(() => {
    if (socket && connected && hostQuizId && isHost && gameState === 'JOINING') {
      socket.emit('host:create-room', {
        quizId: hostQuizId,
        hostUser: user ? { username: user.username } : { username: 'QuizMaster Host' }
      });
    }
  }, [socket, connected, hostQuizId, isHost, gameState]);

  // Handle Manual Join Submit
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!inputPin.trim()) {
      setErrorMessage('Please enter a 6-character room PIN.');
      return;
    }

    if (!inputNickname.trim()) {
      setErrorMessage('Please enter a player nickname.');
      return;
    }

    sounds.playClick();
    socket.emit('player:join-room', {
      roomCode: inputPin.trim().toUpperCase(),
      username: inputNickname.trim(),
      avatar: selectedAvatar
    });
  };

  const handleNextQuestion = () => {
    socket.emit('host:next-question');
  };

  // -------------------------------------------------------------
  // RENDER VIEWS
  // -------------------------------------------------------------

  // View 1: Manual Enter PIN / Nickname Screen
  if (gameState === 'ENTER_PIN' || (gameState === 'JOINING' && !hostQuizId)) {
    return (
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-panel pop-in" style={{ padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚡</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Join Live Room</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter the room PIN provided by the quiz host.
            </p>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleJoinSubmit}>
            <div className="form-group">
              <label className="form-label">Room PIN</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                placeholder="e.g. VQ8492"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.toUpperCase())}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Player Nickname</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. SpeedDemon"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Choose Avatar</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => { sounds.playClick(); setSelectedAvatar(av); }}
                    style={{
                      background: selectedAvatar === av ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${selectedAvatar === av ? 'var(--accent-cyan)' : 'transparent'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 0',
                      fontSize: '1.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Enter Match Lobby ➔
            </button>
          </form>

          <button
            onClick={onExit}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: '14px' }}
          >
            Cancel
          </button>

        </div>
      </div>
    );
  }

  // View 2: Connecting / Initializing
  if (gameState === 'JOINING') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📡</div>
        <h2>Setting up real-time room connection...</h2>
      </div>
    );
  }

  // View 3: Lobby State
  if (gameState === 'LOBBY' || gameState === 'STARTING') {
    return (
      <RoomLobby
        isHost={isHost}
        roomCode={roomCode}
        quizTitle={quizInfo.title}
        category={quizInfo.category}
        totalQuestions={quizInfo.totalQuestions}
        players={players}
        myPlayer={myPlayer}
        onLeaveRoom={onExit}
      />
    );
  }

  // View 4: Question / Result State
  if (gameState === 'QUESTION' || gameState === 'REVEAL') {
    return (
      <LiveGame
        isHost={isHost}
        questionData={currentQuestion}
        timeLeft={timeLeft}
        roundResult={roundResult}
        answeredCount={answeredCount}
        totalPlayers={players.length}
        myPlayer={myPlayer}
        onNextQuestion={handleNextQuestion}
      />
    );
  }

  // View 5: Finished / Podium State
  if (gameState === 'FINISHED' && finalData) {
    return (
      <Podium
        podium={finalData.podium}
        rankings={finalData.rankings}
        quizTitle={finalData.quizTitle}
        onPlayAgain={onExit}
        onBackHome={onExit}
      />
    );
  }

  return null;
};
