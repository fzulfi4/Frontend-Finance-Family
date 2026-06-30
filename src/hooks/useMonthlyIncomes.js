import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useMonthlyIncomes = (enabled = true) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncomes = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/monthly-incomes');
      setIncomes(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch monthly incomes');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const createIncome = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/monthly-incomes', data);
      await fetchIncomes();
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create monthly income');
    } finally {
      setLoading(false);
    }
  };

  const updateIncome = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/monthly-incomes/${id}`, data);
      await fetchIncomes();
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update monthly income');
    } finally {
      setLoading(false);
    }
  };

  const deleteIncome = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/monthly-incomes/${id}`);
      await fetchIncomes();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete monthly income');
    } finally {
      setLoading(false);
    }
  };

  return { incomes, loading, error, fetchIncomes, createIncome, updateIncome, deleteIncome };
};
