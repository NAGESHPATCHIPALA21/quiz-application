const mongoose = require('mongoose');
const { getStatus } = require('../config/db');
const store = require('./store');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, default: 20 }, // seconds
  points: { type: Number, default: 1000 },
  explanation: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['History', 'Science', 'Entertainment', 'Technology', 'General Knowledge', 'Sports']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  creatorName: { type: String, default: 'V-Quiz Master' },
  isPublic: { type: Boolean, default: true },
  playsCount: { type: Number, default: 0 },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

const MongoQuiz = mongoose.model('Quiz', quizSchema);

class QuizRepository {
  static async find(filter = {}) {
    if (getStatus()) {
      let query = MongoQuiz.find();
      if (filter.category) query = query.where('category').equals(filter.category);
      if (filter.creator) query = query.where('creator').equals(filter.creator);
      return await query.sort({ createdAt: -1 });
    }
    return store.quizzes.filter(q => {
      if (filter.category && q.category.toLowerCase() !== filter.category.toLowerCase()) return false;
      if (filter.creator && q.creator !== filter.creator) return false;
      return true;
    });
  }

  static async findById(id) {
    if (getStatus()) {
      return await MongoQuiz.findById(id);
    }
    return store.quizzes.find(q => q._id === id || q.id === id) || null;
  }

  static async create(quizData) {
    if (getStatus()) {
      return await MongoQuiz.create(quizData);
    }
    const newQuiz = {
      _id: store.generateId(),
      ...quizData,
      playsCount: 0,
      createdAt: new Date()
    };
    store.quizzes.push(newQuiz);
    return newQuiz;
  }

  static async update(id, updateData) {
    if (getStatus()) {
      return await MongoQuiz.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = store.quizzes.findIndex(q => q._id === id);
    if (index === -1) return null;
    store.quizzes[index] = { ...store.quizzes[index], ...updateData, updatedAt: new Date() };
    return store.quizzes[index];
  }

  static async delete(id) {
    if (getStatus()) {
      return await MongoQuiz.findByIdAndDelete(id);
    }
    const index = store.quizzes.findIndex(q => q._id === id);
    if (index === -1) return null;
    return store.quizzes.splice(index, 1)[0];
  }

  static async incrementPlays(id) {
    if (getStatus()) {
      await MongoQuiz.findByIdAndUpdate(id, { $inc: { playsCount: 1 } });
      return;
    }
    const quiz = store.quizzes.find(q => q._id === id);
    if (quiz) quiz.playsCount = (quiz.playsCount || 0) + 1;
  }
}

module.exports = { MongoQuiz, QuizRepository };
