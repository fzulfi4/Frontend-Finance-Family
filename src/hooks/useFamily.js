import { useState, useCallback, useContext, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export const useFamily = () => {
  const { user, setUser } = useContext(AuthContext);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const familyId = user?.family_id;

  const fetchFamily = useCallback(async () => {
    if (!familyId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get Family Details
      const familyRes = await api.get(`/families/${familyId}`);
      setFamily(familyRes.data.data);

      // Get Family Members
      const membersRes = await api.get('/users');
      setMembers(membersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch family:', err);
      setError(err.response?.data?.error || 'Failed to fetch family data');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const updateFamily = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/families/${user.family_id}`, { name });
      setFamily(res.data.data);
      return res.data;
    } catch (err) {
      console.error('Failed to update family:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update family';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteFamily = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/families/${user.family_id}`);
      // If family is deleted, the user no longer has a family
      setUser({ ...user, family_id: null });
      return true;
    } catch (err) {
      console.error('Failed to delete family:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete family';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const leaveFamily = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/users/leave-family');
      setUser({ ...user, family_id: null, role: 'member' });
      return true;
    } catch (err) {
      console.error('Failed to leave family:', err);
      const errorMsg = err.response?.data?.error || 'Failed to leave family';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    family,
    members,
    loading,
    error,
    fetchFamily,
    updateFamily,
    deleteFamily,
    leaveFamily
  };
};
