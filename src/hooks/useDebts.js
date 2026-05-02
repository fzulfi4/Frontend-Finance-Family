import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useDebts = (enabled = true) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDebts = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/debts');
      setDebts(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch debts');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const updateDebt = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/debts/${id}`, data);
      await fetchDebts();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update debt');
    } finally {
      setLoading(false);
    }
  };

  const deleteDebt = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/debts/${id}`);
      await fetchDebts();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete debt');
    } finally {
      setLoading(false);
    }
  };

  const totalPayable = debts.filter(d => d.type === 'payable' && d.status !== 'paid').reduce((acc, curr) => acc + (curr.amount - curr.paid_amount), 0);
  const totalReceivable = debts.filter(d => d.type === 'receivable' && d.status !== 'paid').reduce((acc, curr) => acc + (curr.amount - curr.paid_amount), 0);

  return { debts, loading, error, fetchDebts, totalPayable, totalReceivable, updateDebt, deleteDebt };
};
