import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useMonthlyExpenses = (enabled = true) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/monthly-expenses');
      setExpenses(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch monthly expenses');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/monthly-expenses', data);
      await fetchExpenses();
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create monthly expense');
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/monthly-expenses/${id}`, data);
      await fetchExpenses();
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update monthly expense');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/monthly-expenses/${id}`);
      await fetchExpenses();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete monthly expense');
    } finally {
      setLoading(false);
    }
  };

  return { expenses, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense };
};
