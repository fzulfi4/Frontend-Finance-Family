import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useWallets = (enabled = true) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallets = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setWallets(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const updateWallet = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/accounts/${id}`, data);
      await fetchWallets(); // refresh data
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/accounts/${id}`);
      await fetchWallets(); // refresh data
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete wallet');
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

  return { wallets, loading, error, fetchWallets, totalBalance, updateWallet, deleteWallet };
};
