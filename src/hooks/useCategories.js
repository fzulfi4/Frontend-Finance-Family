import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useCategories = (enabled = true) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/categories', data);
      await fetchCategories(); // refresh data
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/categories/${id}`, data);
      await fetchCategories(); // refresh data
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/categories/${id}`);
      await fetchCategories(); // refresh data
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory };
};
