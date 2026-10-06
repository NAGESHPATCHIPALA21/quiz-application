const bcrypt = require('bcryptjs');
const { UserRepository } = require('./models/User');
const { QuizRepository } = require('./models/Quiz');
const { ScoreRepository } = require('./models/Score');

const defaultQuizzes = [
  {
    title: 'World History Expeditions',
    description: 'Test your knowledge on defining moments, historical leaders, and global milestones.',
    category: 'History',
    difficulty: 'Medium',
    creatorName: 'Professor History',
    isPublic: true,
    questions: [
      {
        question: 'When did World War II start?',
        options: ['1939', '1941', '1945', '1950'],
        correctAnswer: '1939',
        timeLimit: 15,
        points: 1000,
        explanation: 'World War II began in Europe on September 1, 1939, when Germany invaded Poland.'
      },
      {
        question: 'Who was the first President of the United States?',
        options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
        correctAnswer: 'George Washington',
        timeLimit: 15,
        points: 1000,
        explanation: 'George Washington served as the first U.S. President from 1789 to 1797.'
      },
      {
        question: 'In which year did India gain independence?',
        options: ['1945', '1947', '1950', '1935'],
        correctAnswer: '1947',
        timeLimit: 15,
        points: 1000,
        explanation: 'India achieved independence from British rule on August 15, 1947.'
      },
      {
        question: "Who wrote 'The Communist Manifesto'?",
        options: ['Karl Marx & Friedrich Engels', 'Vladimir Lenin', 'Joseph Stalin', 'Leon Trotsky'],
        correctAnswer: 'Karl Marx & Friedrich Engels',
        timeLimit: 15,
        points: 1000,
        explanation: 'The Communist Manifesto was published in 1848 by Karl Marx and Friedrich Engels.'
      }
    ]
  },
  {
    title: 'Core Science & Cosmos',
    description: 'Explore fundamental chemistry, physics, and cosmic wonders.',
    category: 'Science',
    difficulty: 'Medium',
    creatorName: 'Dr. Cosmos',
    isPublic: true,
    questions: [
      {
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'N2'],
        correctAnswer: 'H2O',
        timeLimit: 15,
        points: 1000,
        explanation: 'Water molecules consist of two hydrogen atoms bonded to one oxygen atom.'
      },
      {
        question: 'Who proposed the theory of general relativity?',
        options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Niels Bohr'],
        correctAnswer: 'Albert Einstein',
        timeLimit: 15,
        points: 1000,
        explanation: 'Albert Einstein formulated General Relativity in 1915.'
      },
      {
        question: 'What is the atomic number of Carbon?',
        options: ['6', '12', '14', '8'],
        correctAnswer: '6',
        timeLimit: 15,
        points: 1000,
        explanation: 'Carbon has 6 protons, giving it atomic number 6.'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        timeLimit: 15,
        points: 1000,
        explanation: 'Mars appears reddish due to iron oxide (rust) on its surface.'
      }
    ]
  },
  {
    title: 'Pop Culture & Cinema Trivia',
    description: 'From iconic blockbusters to legendary rock anthems.',
    category: 'Entertainment',
    difficulty: 'Easy',
    creatorName: 'Cinephile Extraordinaire',
    isPublic: true,
    questions: [
      {
        question: "Who directed the mind-bending sci-fi movie 'Inception'?",
        options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Quentin Tarantino'],
        correctAnswer: 'Christopher Nolan',
        timeLimit: 15,
        points: 1000,
        explanation: 'Christopher Nolan wrote and directed Inception (2010).'
      },
      {
        question: "Which actor played Jack Dawson in the blockbuster 'Titanic'?",
        options: ['Leonardo DiCaprio', 'Brad Pitt', 'Matt Damon', 'Tom Cruise'],
        correctAnswer: 'Leonardo DiCaprio',
        timeLimit: 15,
        points: 1000,
        explanation: 'Leonardo DiCaprio played Jack Dawson opposite Kate Winslet.'
      },
      {
        question: "Who is globally recognized as the 'King of Pop'?",
        options: ['Michael Jackson', 'Elvis Presley', 'Prince', 'Freddie Mercury'],
        correctAnswer: 'Michael Jackson',
        timeLimit: 15,
        points: 1000,
        explanation: 'Michael Jackson was crowned the King of Pop for his ground-breaking music and choreography.'
      },
      {
        question: "Which legendary British rock band recorded 'Bohemian Rhapsody'?",
        options: ['Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
        correctAnswer: 'Queen',
        timeLimit: 15,
        points: 1000,
        explanation: 'Queen released Bohemian Rhapsody on their 1975 album A Night at the Opera.'
      }
    ]
  },
  {
    title: 'Full-Stack & Real-Time Engineering',
    description: 'Level up your developer IQ with questions on React, Node.js, WebSockets, and MongoDB.',
    category: 'Technology',
    difficulty: 'Hard',
    creatorName: 'Nagesh Patchipala',
    isPublic: true,
    questions: [
      {
        question: 'What is the primary benefit of WebSockets over standard HTTP polling for multiplayer games?',
        options: [
          'Full-duplex, persistent bidirectional connection with low latency',
          'Automatic database indexing',
          'Faster CSS stylesheet parsing',
          'Elimination of TLS encryption'
        ],
        correctAnswer: 'Full-duplex, persistent bidirectional connection with low latency',
        timeLimit: 20,
        points: 1200,
        explanation: 'WebSockets allow bidirectional message streaming over a single TCP connection without HTTP header overhead.'
      },
      {
        question: 'In React, what hook is best suited to manage WebSocket subscriptions and cleanup on unmount?',
        options: ['useEffect', 'useMemo', 'useContext', 'useId'],
        correctAnswer: 'useEffect',
        timeLimit: 15,
        points: 1000,
        explanation: 'useEffect handles external side effects and provides a cleanup function on unmount.'
      },
      {
        question: 'Which MongoDB feature allows grouping and transforming data efficiently for leaderboards?',
        options: ['Aggregation Pipeline', 'B-Tree Indexing', 'GridFS', 'Replica Sets'],
        correctAnswer: 'Aggregation Pipeline',
        timeLimit: 20,
        points: 1200,
        explanation: 'The MongoDB aggregation framework processes data records and outputs computed results like top scores.'
      },
      {
        question: 'What does JWT stand for in modern stateless authentication?',
        options: [
          'JSON Web Token',
          'JavaScript Web Transport',
          'Java Web Transaction',
          'Joint Web Technology'
        ],
        correctAnswer: 'JSON Web Token',
        timeLimit: 15,
        points: 1000,
        explanation: 'JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information as a JSON object.'
      }
    ]
  }
];

const seedInitialData = async () => {
  try {
    // 1. Seed Demo Creator User
    const existingCreator = await UserRepository.findOne({ email: 'creator@vquiz.dev' });
    let creatorId = null;
    if (!existingCreator) {
      const hashedPassword = await bcrypt.hash('quizmaster123', 10);
      const creator = await UserRepository.create({
        username: 'Creator_Nagesh',
        email: 'creator@vquiz.dev',
        password: hashedPassword,
        role: 'creator'
      });
      creatorId = creator._id;
      console.log('🌱 Seeded Demo Creator user (email: creator@vquiz.dev / pass: quizmaster123)');
    } else {
      creatorId = existingCreator._id;
    }

    // 2. Seed Default Quizzes
    const existingQuizzes = await QuizRepository.find({});
    if (existingQuizzes.length === 0) {
      for (const q of defaultQuizzes) {
        await QuizRepository.create({
          ...q,
          creator: creatorId
        });
      }
      console.log(`🌱 Seeded ${defaultQuizzes.length} default quizzes into V-Quiz catalog.`);
    }

    // 3. Seed Sample Leaderboard Entries
    const existingScores = await ScoreRepository.getLeaderboard(5);
    if (existingScores.length === 0) {
      const allQuizzes = await QuizRepository.find({});
      const targetQuiz = allQuizzes[0];
      if (targetQuiz) {
        await ScoreRepository.create({
          quizId: targetQuiz._id,
          quizTitle: targetQuiz.title,
          username: 'Alex_Speedrunner',
          score: 3850,
          totalQuestions: 4,
          correctAnswers: 4,
          accuracy: 100,
          mode: 'multiplayer'
        });
        await ScoreRepository.create({
          quizId: targetQuiz._id,
          quizTitle: targetQuiz.title,
          username: 'CyberNinja',
          score: 3100,
          totalQuestions: 4,
          correctAnswers: 3,
          accuracy: 75,
          mode: 'multiplayer'
        });
        await ScoreRepository.create({
          quizId: targetQuiz._id,
          quizTitle: targetQuiz.title,
          username: 'QuizWhiz',
          score: 2800,
          totalQuestions: 4,
          correctAnswers: 3,
          accuracy: 75,
          mode: 'solo'
        });
        console.log('🌱 Seeded initial leaderboard scores.');
      }
    }
  } catch (error) {
    console.error('Error during data seed:', error);
  }
};

module.exports = { seedInitialData, defaultQuizzes };
