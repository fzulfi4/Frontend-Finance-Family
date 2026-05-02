import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useTransactions = (enabled = true) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateTransaction = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/transactions/${id}`, data);
      await fetchTransactions();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/transactions/${id}`);
      await fetchTransactions();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, error, fetchTransactions, updateTransaction, deleteTransaction };
};
