import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useMembers = (enabled = true) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/users');
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading };
};
