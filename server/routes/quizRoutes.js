const express = require('express');
const router = express.Router();
const { QuizRepository } = require('../models/Quiz');
const { ScoreRepository } = require('../models/Score');
const { UserRepository } = require('../models/User');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// @route   GET /api/quizzes
// @desc    Get all public quizzes with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    let quizzes = await QuizRepository.find(filter);

    if (search) {
      const term = search.toLowerCase();
      quizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(term) ||
        (q.description && q.description.toLowerCase().includes(term))
      );
    }

    // Strip out correct answers for public listing summary
    const summaryQuizzes = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      category: q.category,
      difficulty: q.difficulty,
      creatorName: q.creatorName,
      questionCount: q.questions ? q.questions.length : 0,
      playsCount: q.playsCount || 0,
      createdAt: q.createdAt
    }));

    res.json({ success: true, count: summaryQuizzes.length, data: summaryQuizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quizzes.' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quiz = await QuizRepository.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Fetch quiz by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quiz.' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz with custom questions (Creator mode)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, category, difficulty, questions } = req.body;

    if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title, valid category, and at least 1 question.'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length < 2 || !q.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question #${i + 1} must include a prompt, at least 2 options, and a correct answer.`
        });
      }
    }

    const newQuiz = await QuizRepository.create({
      title: title.trim(),
      description: description || '',
      category,
      difficulty: difficulty || 'Medium',
      creator: req.user._id,
      creatorName: req.user.username,
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer.trim(),
        timeLimit: Number(q.timeLimit) || 20,
        points: Number(q.points) || 1000,
        explanation: q.explanation || ''
      }))
    });

    res.status(201).json({ success: true, message: 'Quiz created successfully!', data: newQuiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error creating quiz.' });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await QuizRepository.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Allow creator or admin
    if (quiz.creator && quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'creator') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz.' });
    }

    const updated = await QuizRepository.update(req.params.id, req.body);
    res.json({ success: true, message: 'Quiz updated.', data: updated });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error updating quiz.' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await QuizRepository.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (quiz.creator && quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'creator') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz.' });
    }

    await QuizRepository.delete(req.params.id);
    res.json({ success: true, message: 'Quiz removed successfully.' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting quiz.' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit solo quiz answers and compute score
router.post('/:id/submit', optionalAuth, async (req, res) => {
  try {
    const { answers, username } = req.body;
    const quiz = await QuizRepository.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    let calculatedScore = 0;
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const answerBreakdown = [];

    // Calculate answers
    quiz.questions.forEach((q, index) => {
      const userAnswer = answers ? answers[index] : null;
      const isCorrect = userAnswer === q.correctAnswer;
      const basePoints = q.points || 1000;

      if (isCorrect) {
        correctCount++;
        calculatedScore += basePoints;
      }

      answerBreakdown.push({
        questionIndex: index,
        question: q.question,
        userAnswer: userAnswer || 'Skipped',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const playerName = req.user ? req.user.username : (username || 'Guest Player');

    // Save score record
    const scoreRecord = await ScoreRepository.create({
      quizId: quiz._id,
      quizTitle: quiz.title,
      userId: req.user ? req.user._id : null,
      username: playerName,
      score: calculatedScore,
      totalQuestions,
      correctAnswers: correctCount,
      accuracy,
      mode: 'solo'
    });

    // Update user stats if authenticated
    if (req.user) {
      await UserRepository.updateStats(req.user._id, calculatedScore);
    }

    // Increment play count
    await QuizRepository.incrementPlays(quiz._id);

    res.json({
      success: true,
      data: {
        score: calculatedScore,
        totalQuestions,
        correctAnswers: correctCount,
        accuracy,
        answerBreakdown,
        scoreId: scoreRecord._id
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ success: false, message: 'Server error during submission.' });
  }
});

module.exports = router;
