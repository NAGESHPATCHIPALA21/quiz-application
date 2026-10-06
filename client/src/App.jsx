import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { QuizList } from './pages/QuizList';
import { QuizCreate } from './pages/QuizCreate';
import { SoloQuiz } from './pages/SoloQuiz';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MultiplayerRoom } from './pages/MultiplayerRoom';

function MainApp() {
  const [activeView, setActiveView] = useState('home');
  // 'home' | 'quizzes' | 'join' | 'solo' | 'multiplayer' | 'create' | 'leaderboard'

  const [activeQuizId, setActiveQuizId] = useState(null);
  const [roomPin, setRoomPin] = useState('');
  const [isHostMode, setIsHostMode] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const { isCreator } = useAuth();

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartSolo = (quizId) => {
    setActiveQuizId(quizId);
    setActiveView('solo');
  };

  const handleHostRoom = (quizId) => {
    setActiveQuizId(quizId);
    setIsHostMode(true);
    setRoomPin('');
    setActiveView('multiplayer');
  };

  const handleJoinWithCode = (pin) => {
    setRoomPin(pin);
    setIsHostMode(false);
    setActiveQuizId(null);
    setActiveView('multiplayer');
  };

  return (
    <div>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={handleOpenAuth}
      />

      <main className="page-wrapper">
        {activeView === 'home' && (
          <Home
            onNavigate={setActiveView}
            onJoinWithCode={handleJoinWithCode}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeView === 'quizzes' && (
          <QuizList
            onSelectSolo={handleStartSolo}
            onSelectHost={handleHostRoom}
          />
        )}

        {activeView === 'join' && (
          <MultiplayerRoom
            initialCode=""
            hostQuizId={null}
            onExit={() => setActiveView('home')}
          />
        )}

        {activeView === 'solo' && (
          <SoloQuiz
            quizId={activeQuizId}
            onExit={() => setActiveView('quizzes')}
            onPlayAgain={() => setActiveView('solo')}
          />
        )}

        {activeView === 'multiplayer' && (
          <MultiplayerRoom
            initialCode={roomPin}
            hostQuizId={isHostMode ? activeQuizId : null}
            onExit={() => setActiveView('home')}
          />
        )}

        {activeView === 'create' && (
          <QuizCreate
            onSuccess={() => setActiveView('quizzes')}
            onCancel={() => setActiveView('quizzes')}
          />
        )}

        {activeView === 'leaderboard' && (
          <LeaderboardPage />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
