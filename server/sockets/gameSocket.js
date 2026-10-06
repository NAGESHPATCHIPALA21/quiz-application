const { QuizRepository } = require('../models/Quiz');
const { ScoreRepository } = require('../models/Score');

// Active multiplayer rooms in memory
const rooms = new Map();

// Helper to generate 6-character room codes (e.g. VQ-5821)
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const registerGameSockets = (io) => {
  io.on('connection', (socket) => {
    // ---------------------------------------------------------
    // 1. HOST: CREATE ROOM
    // ---------------------------------------------------------
    socket.on('host:create-room', async ({ quizId, hostUser }) => {
      try {
        const quiz = await QuizRepository.findById(quizId);
        if (!quiz) {
          return socket.emit('error:room', { message: 'Quiz not found.' });
        }

        let roomCode = generateRoomCode();
        while (rooms.has(roomCode)) {
          roomCode = generateRoomCode();
        }

        const room = {
          code: roomCode,
          hostSocketId: socket.id,
          hostUser: hostUser || { username: 'Host' },
          quiz,
          state: 'LOBBY', // LOBBY, QUESTION, REVEAL, LEADERBOARD, FINISHED
          currentQuestionIndex: 0,
          players: new Map(), // socketId -> playerObj
          timer: null,
          timeLeft: 0,
          roundAnswersCount: 0
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = true;

        socket.emit('room:created', {
          roomCode,
          quizTitle: quiz.title,
          category: quiz.category,
          totalQuestions: quiz.questions.length
        });

        console.log(`🎮 [Room ${roomCode}] Created by host ${socket.id} for quiz: "${quiz.title}"`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error:room', { message: 'Failed to create room.' });
      }
    });

    // ---------------------------------------------------------
    // 2. PLAYER: JOIN ROOM
    // ---------------------------------------------------------
    socket.on('player:join-room', ({ roomCode, username, avatar }) => {
      const code = roomCode ? roomCode.trim().toUpperCase() : '';
      const room = rooms.get(code);

      if (!room) {
        return socket.emit('error:join', { message: 'Room not found. Please check the 6-character code.' });
      }

      if (room.state !== 'LOBBY') {
        return socket.emit('error:join', { message: 'Game has already started in this room.' });
      }

      // Check duplicate name in room
      const existingName = Array.from(room.players.values()).find(
        p => p.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (existingName) {
        return socket.emit('error:join', { message: 'Nickname is already taken in this room. Pick another.' });
      }

      const player = {
        id: socket.id,
        username: username.trim(),
        avatar: avatar || '⚡',
        score: 0,
        streak: 0,
        currentAnswer: null,
        answeredTime: null,
        isCorrect: false,
        correctCount: 0,
        totalAnswered: 0
      };

      room.players.set(socket.id, player);
      socket.join(code);
      socket.roomCode = code;
      socket.isHost = false;

      // Notify player
      socket.emit('room:joined', {
        roomCode: code,
        quizTitle: room.quiz.title,
        category: room.quiz.category,
        totalQuestions: room.quiz.questions.length,
        player
      });

      // Broadcast updated players list to room
      const playerList = Array.from(room.players.values()).map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        score: p.score
      }));

      io.to(code).emit('room:players-updated', {
        players: playerList,
        count: playerList.length
      });

      console.log(`👤 [Room ${code}] Player "${username}" joined. Total players: ${playerList.length}`);
    });

    // ---------------------------------------------------------
    // 3. HOST: START GAME
    // ---------------------------------------------------------
    socket.on('host:start-game', () => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.hostSocketId !== socket.id) return;

      if (room.players.size === 0) {
        return socket.emit('error:game', { message: 'Wait for at least 1 player to join before starting.' });
      }

      room.state = 'STARTING';
      io.to(room.code).emit('game:starting', { countdownSeconds: 3 });

      // Start first question after 3 second countdown
      setTimeout(() => {
        if (rooms.has(room.code)) {
          room.currentQuestionIndex = 0;
          sendQuestion(room, io);
        }
      }, 3000);
    });

    // ---------------------------------------------------------
    // 4. PLAYER: SUBMIT ANSWER
    // ---------------------------------------------------------
    socket.on('player:submit-answer', ({ answer }) => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.state !== 'QUESTION') return;

      const player = room.players.get(socket.id);
      if (!player || player.currentAnswer !== null) return; // Prevent double submit

      const q = room.quiz.questions[room.currentQuestionIndex];
      const isCorrect = answer === q.correctAnswer;
      const basePoints = q.points || 1000;
      const timeLimit = q.timeLimit || 20;

      // Speed bonus: faster answer = more points (between 50% and 100% of base points)
      const speedMultiplier = Math.max(0.5, room.timeLeft / timeLimit);
      let roundPoints = 0;

      if (isCorrect) {
        player.streak += 1;
        const streakBonus = Math.min(player.streak * 50, 250);
        roundPoints = Math.round(basePoints * speedMultiplier + streakBonus);
        player.score += roundPoints;
        player.correctCount += 1;
        player.isCorrect = true;
      } else {
        player.streak = 0;
        player.isCorrect = false;
      }

      player.currentAnswer = answer;
      player.lastPointsGained = roundPoints;
      player.totalAnswered += 1;
      room.roundAnswersCount += 1;

      // Acknowledge submission to the player
      socket.emit('player:answer-received', {
        selected: answer,
        streak: player.streak
      });

      // Notify host and room of progress
      io.to(room.code).emit('game:answer-progress', {
        answeredCount: room.roundAnswersCount,
        totalPlayers: room.players.size
      });

      // If all players have answered, conclude round immediately!
      if (room.roundAnswersCount >= room.players.size) {
        if (room.timer) clearInterval(room.timer);
        endQuestion(room, io);
      }
    });

    // ---------------------------------------------------------
    // 5. HOST: NEXT QUESTION
    // ---------------------------------------------------------
    socket.on('host:next-question', () => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.hostSocketId !== socket.id) return;

      if (room.currentQuestionIndex + 1 < room.quiz.questions.length) {
        room.currentQuestionIndex += 1;
        sendQuestion(room, io);
      } else {
        finishGame(room, io);
      }
    });

    // ---------------------------------------------------------
    // DISCONNECT HANDLER
    // ---------------------------------------------------------
    socket.on('disconnect', () => {
      const room = rooms.get(socket.roomCode);
      if (!room) return;

      if (socket.isHost) {
        console.log(`🔌 [Room ${room.code}] Host disconnected. Terminating room.`);
        if (room.timer) clearInterval(room.timer);
        io.to(room.code).emit('room:closed', { message: 'Host left the room. Game ended.' });
        rooms.delete(room.code);
      } else {
        const player = room.players.get(socket.id);
        if (player) {
          console.log(`🔌 [Room ${room.code}] Player "${player.username}" disconnected.`);
          room.players.delete(socket.id);

          const updatedList = Array.from(room.players.values()).map(p => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            score: p.score
          }));

          io.to(room.code).emit('room:players-updated', {
            players: updatedList,
            count: updatedList.length
          });

          // Check if game was waiting for this player to finish
          if (room.state === 'QUESTION' && room.roundAnswersCount >= room.players.size) {
            if (room.timer) clearInterval(room.timer);
            endQuestion(room, io);
          }
        }
      }
    });
  });
};

// ---------------------------------------------------------
// SYNCHRONIZED QUESTION LAUNCHER
// ---------------------------------------------------------
function sendQuestion(room, io) {
  room.state = 'QUESTION';
  room.roundAnswersCount = 0;
  const q = room.quiz.questions[room.currentQuestionIndex];
  room.timeLeft = q.timeLimit || 20;

  // Reset player answers for this question
  for (const player of room.players.values()) {
    player.currentAnswer = null;
    player.lastPointsGained = 0;
    player.isCorrect = false;
  }

  // Broadcast question payload (without revealing correct answer!)
  io.to(room.code).emit('game:new-question', {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.quiz.questions.length,
    question: q.question,
    options: q.options,
    timeLimit: q.timeLimit || 20,
    points: q.points || 1000
  });

  if (room.timer) clearInterval(room.timer);

  room.timer = setInterval(() => {
    room.timeLeft -= 1;
    io.to(room.code).emit('game:timer-tick', { timeLeft: room.timeLeft });

    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      endQuestion(room, io);
    }
  }, 1000);
}

// ---------------------------------------------------------
// QUESTION REVEAL & RESULT CALCULATION
// ---------------------------------------------------------
function endQuestion(room, io) {
  room.state = 'REVEAL';
  const q = room.quiz.questions[room.currentQuestionIndex];

  // Calculate answer distribution
  const distribution = {};
  q.options.forEach(opt => { distribution[opt] = 0; });
  distribution['No Answer'] = 0;

  for (const player of room.players.values()) {
    if (player.currentAnswer && distribution[player.currentAnswer] !== undefined) {
      distribution[player.currentAnswer]++;
    } else {
      distribution['No Answer']++;
    }
  }

  // Sorted leaderboard
  const sortedPlayers = Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({
      rank: index + 1,
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      streak: p.streak,
      lastPointsGained: p.lastPointsGained,
      isCorrect: p.isCorrect,
      selectedAnswer: p.currentAnswer
    }));

  io.to(room.code).emit('game:question-revealed', {
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    distribution,
    leaderboard: sortedPlayers,
    isLastQuestion: room.currentQuestionIndex + 1 >= room.quiz.questions.length
  });
}

// ---------------------------------------------------------
// GAME FINALE: PODIUM & SCORE SAVING
// ---------------------------------------------------------
async function finishGame(room, io) {
  room.state = 'FINISHED';
  if (room.timer) clearInterval(room.timer);

  const finalRankings = Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({
      rank: index + 1,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      correctCount: p.correctCount,
      accuracy: Math.round((p.correctCount / room.quiz.questions.length) * 100)
    }));

  // Top 3 Podium
  const podium = {
    first: finalRankings[0] || null,
    second: finalRankings[1] || null,
    third: finalRankings[2] || null
  };

  io.to(room.code).emit('game:over', {
    podium,
    rankings: finalRankings,
    totalQuestions: room.quiz.questions.length,
    quizTitle: room.quiz.title
  });

  // Save multiplayer scores to repository for global leaderboard
  try {
    for (const player of finalRankings) {
      await ScoreRepository.create({
        quizId: room.quiz._id,
        quizTitle: room.quiz.title,
        username: player.username,
        score: player.score,
        totalQuestions: room.quiz.questions.length,
        correctAnswers: player.correctCount,
        accuracy: player.accuracy,
        mode: 'multiplayer',
        roomCode: room.code
      });
    }
  } catch (err) {
    console.error('Error persisting multiplayer scores:', err);
  }

  // Increment quiz plays
  try {
    await QuizRepository.incrementPlays(room.quiz._id);
  } catch (_) {}

  // Keep room alive for 5 minutes for post-game chat, then clean up
  setTimeout(() => {
    rooms.delete(room.code);
  }, 5 * 60 * 1000);
}

module.exports = { registerGameSockets };
