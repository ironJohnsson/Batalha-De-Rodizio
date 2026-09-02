import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('contarodizio_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
        setStats(data.stats);
      } catch (err) {
        console.warn('Sessão expirada ou inválida:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (nickname, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nickname, password })
    });
    localStorage.setItem('contarodizio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setStats(data.stats);
    return data;
  };

  const register = async (nickname, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nickname, password })
    });
    localStorage.setItem('contarodizio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setStats(data.stats);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('contarodizio_token');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      console.warn('Erro ao atualizar perfil:', err);
    }
  };

  const updateNickname = async (newNickname) => {
    const data = await apiRequest('/auth/update-nickname', {
      method: 'PUT',
      body: JSON.stringify({ newNickname })
    });
    if (data.token) {
      localStorage.setItem('contarodizio_token', data.token);
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      stats,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateNickname,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

