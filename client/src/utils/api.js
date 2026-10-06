// REST API Client helper with Authorization headers and error handling

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('vquiz_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  auth: {
    login: async (emailOrUsername, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      return res.json();
    },
    register: async (username, email, password, role) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      return res.json();
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return res.json();
    }
  },

  // Quizzes
  quizzes: {
    getAll: async (category = '', search = '') => {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/quizzes?${params.toString()}`);
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, {
        headers: getHeaders()
      });
      return res.json();
    },
    create: async (quizData) => {
      const res = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(quizData)
      });
      return res.json();
    },
    update: async (id, quizData) => {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(quizData)
      });
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.json();
    },
    submitSolo: async (id, answers, username) => {
      const res = await fetch(`${API_BASE}/quizzes/${id}/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ answers, username })
      });
      return res.json();
    }
  },

  // Leaderboard
  leaderboard: {
    getGlobal: async (limit = 15) => {
      const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);
      return res.json();
    },
    getByQuiz: async (quizId) => {
      const res = await fetch(`${API_BASE}/leaderboard/quiz/${quizId}`);
      return res.json();
    }
  }
};
