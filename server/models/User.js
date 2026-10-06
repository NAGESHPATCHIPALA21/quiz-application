const mongoose = require('mongoose');
const { getStatus } = require('../config/db');
const store = require('./store');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['creator', 'participant'],
    default: 'participant'
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongoUser = mongoose.model('User', userSchema);

class UserRepository {
  static async findOne(query) {
    if (getStatus()) {
      return await MongoUser.findOne(query);
    }
    return store.users.find(u => {
      if (query._id && u._id !== query._id) return false;
      if (query.email && u.email.toLowerCase() !== query.email.toLowerCase()) return false;
      if (query.username && u.username.toLowerCase() !== query.username.toLowerCase()) return false;
      return true;
    }) || null;
  }

  static async findById(id) {
    if (getStatus()) {
      return await MongoUser.findById(id).select('-password');
    }
    const user = store.users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async create(userData) {
    if (getStatus()) {
      return await MongoUser.create(userData);
    }
    const newUser = {
      _id: store.generateId(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'participant',
      stats: { gamesPlayed: 0, totalScore: 0, highestScore: 0 },
      createdAt: new Date()
    };
    store.users.push(newUser);
    return newUser;
  }

  static async updateStats(userId, scoreEarned) {
    if (getStatus()) {
      const user = await MongoUser.findById(userId);
      if (user) {
        user.stats.gamesPlayed += 1;
        user.stats.totalScore += scoreEarned;
        if (scoreEarned > user.stats.highestScore) user.stats.highestScore = scoreEarned;
        await user.save();
      }
      return;
    }
    const user = store.users.find(u => u._id === userId);
    if (user) {
      user.stats.gamesPlayed = (user.stats.gamesPlayed || 0) + 1;
      user.stats.totalScore = (user.stats.totalScore || 0) + scoreEarned;
      if (scoreEarned > (user.stats.highestScore || 0)) {
        user.stats.highestScore = scoreEarned;
      }
    }
  }
}

module.exports = { MongoUser, UserRepository };
