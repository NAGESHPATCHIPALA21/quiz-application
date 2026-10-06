const express = require('express');
const router = express.Router();
const { ScoreRepository } = require('../models/Score');

// @route   GET /api/leaderboard
// @desc    Get top global high scores
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const leaderboard = await ScoreRepository.getLeaderboard(limit);
    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving leaderboard.' });
  }
});

// @route   GET /api/leaderboard/quiz/:quizId
// @desc    Get leaderboard for a specific quiz
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const scores = await ScoreRepository.getByQuiz(req.params.quizId, limit);
    res.json({ success: true, data: scores });
  } catch (error) {
    console.error('Fetch quiz scores error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quiz leaderboard.' });
  }
});

module.exports = router;
