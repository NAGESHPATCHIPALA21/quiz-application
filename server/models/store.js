// In-memory data store for standalone running without MongoDB
const crypto = require('crypto');

const store = {
  users: [],
  quizzes: [],
  scores: [],

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }
};

module.exports = store;
