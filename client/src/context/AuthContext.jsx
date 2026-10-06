import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vquiz_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const res = await api.auth.login(emailOrUsername, password);
    if (res.success && res.token) {
      localStorage.setItem('vquiz_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed.' };
  };

  const register = async (username, email, password, role) => {
    const res = await api.auth.register(username, email, password, role);
    if (res.success && res.token) {
      localStorage.setItem('vquiz_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed.' };
  };

  const logout = () => {
    localStorage.removeItem('vquiz_token');
    setToken(null);
    setUser(null);
  };

  // Quick Demo Logins for Testing & Recruiters
  const demoLogin = async (role = 'creator') => {
    if (role === 'creator') {
      return await login('creator@vquiz.dev', 'quizmaster123');
    } else {
      // Create or log into a quick participant demo
      const randomNick = 'Player_' + Math.floor(1000 + Math.random() * 9000);
      return await register(randomNick, `${randomNick.toLowerCase()}@demo.dev`, 'player123', 'participant');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, isCreator: user?.role === 'creator' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
