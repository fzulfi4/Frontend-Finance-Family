import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        await fetchUser();
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user_id } = res.data.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', user_id);
    
    setToken(access_token);
    return res.data;
  };

  const register = async (email, password, full_name) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    // If auto-confirm is off, token will be empty.
    const { access_token, user_id } = res.data.data;
    if (access_token) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user_id);
      setToken(access_token);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (full_name) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error("User ID not found");
    const res = await api.put(`/users/${userId}`, { full_name });
    setUser(res.data.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, updateProfile, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
