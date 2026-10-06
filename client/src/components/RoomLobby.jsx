import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/sound';

const AVATARS = ['⚡', '🚀', '🔥', '👾', '🦊', '🐯', '🐼', '🦄', '🎯', '💎', '👑', '🧙'];

export const RoomLobby = ({
  isHost,
  roomCode,
  quizTitle,
  category,
  totalQuestions,
  players = [],
  myPlayer,
  onLeaveRoom
}) => {
  const { socket } = useSocket();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const copyRoomCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      alert('Wait for at least one player to join before starting!');
      return;
    }
    sounds.playCountdownBeep(true);
    socket.emit('host:start-game');
  };

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <div className="glass-panel pop-in" style={{ padding: '36px', textAlign: 'center' }}>
        
        {/* Header Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <span className="badge badge-cyan">{category}</span>
          <span className="badge badge-violet">{totalQuestions} Questions</span>
          <span className="badge badge-emerald">Live Room</span>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{quizTitle}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
          {isHost ? 'Share this Room PIN with participants to let them join!' : 'You are in the lobby. Waiting for the host to launch the quiz!'}
        </p>

        {/* Big Room PIN Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '2px dashed var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-glow-cyan)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            ROOM ACCESS PIN
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '3.4rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: 'var(--accent-cyan)',
            textShadow: '0 0 20px rgba(0, 242, 254, 0.6)'
          }}>
            {roomCode}
          </span>
          <button
            onClick={copyRoomCode}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '4px' }}
          >
            {copied ? '✓ PIN Copied!' : '📋 Copy PIN'}
          </button>
        </div>

        {/* Players in Room */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥 Connected Players</span>
              <span className="badge badge-cyan">{players.length}</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {players.length === 0 ? 'Waiting for challengers...' : 'Ready to compete'}
            </span>
          </div>

          {players.length === 0 ? (
            <div style={{
              padding: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--text-muted)',
              fontSize: '0.95rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📡</div>
              Waiting for players to join with PIN <strong>{roomCode}</strong>...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '12px'
            }}>
              {players.map((p) => {
                const isMe = myPlayer && myPlayer.id === p.id;
                return (
                  <div
                    key={p.id}
                    className="pop-in"
                    style={{
                      background: isMe ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isMe ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{p.avatar || '⚡'}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {p.username}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isMe ? 'var(--accent-cyan)' : 'var(--text-faint)' }}>
                        {isMe ? 'You' : 'Ready'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => {
              sounds.playClick();
              onLeaveRoom();
            }}
            className="btn btn-outline"
          >
            Leave Room
          </button>

          {isHost ? (
            <button
              onClick={handleStartGame}
              className="btn btn-primary btn-lg pulse-glow"
              disabled={players.length === 0}
            >
              🚀 Start Quiz ({players.length} Ready)
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--accent-cyan)',
              fontWeight: 600
            }}>
              <span className="pulse-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
              Waiting for Host to begin the match...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
