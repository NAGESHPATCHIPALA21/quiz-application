const mongoose = require('mongoose');
const { getStatus } = require('../config/db');
const store = require('./store');

const scoreSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  quizTitle: { type: String, default: 'V-Quiz' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  accuracy: { type: Number, required: true }, // percentage
  mode: { type: String, enum: ['solo', 'multiplayer'], default: 'solo' },
  roomCode: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const MongoScore = mongoose.model('Score', scoreSchema);

class ScoreRepository {
  static async create(scoreData) {
    if (getStatus()) {
      return await MongoScore.create(scoreData);
    }
    const newScore = {
      _id: store.generateId(),
      ...scoreData,
      createdAt: new Date()
    };
    store.scores.push(newScore);
    return newScore;
  }

  static async getLeaderboard(limit = 10) {
    if (getStatus()) {
      return await MongoScore.find()
        .sort({ score: -1, accuracy: -1, createdAt: -1 })
        .limit(limit);
    }
    return [...store.scores]
      .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
      .slice(0, limit);
  }

  static async getByQuiz(quizId, limit = 10) {
    if (getStatus()) {
      return await MongoScore.find({ quizId })
        .sort({ score: -1, accuracy: -1 })
        .limit(limit);
    }
    return store.scores
      .filter(s => s.quizId === quizId)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = { MongoScore, ScoreRepository };
