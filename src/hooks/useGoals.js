import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useGoals = (enabled = true) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateGoal = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/goals/${id}`, data);
      await fetchGoals();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/goals/${id}`);
      await fetchGoals();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  return { goals, loading, error, fetchGoals, updateGoal, deleteGoal };
};
