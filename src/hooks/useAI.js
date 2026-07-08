import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook untuk berinteraksi dengan AI Chat endpoint.
 * Menyimpan conversation history secara lokal (per session).
 */
export const useAIChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Kirim pesan ke AI Chat endpoint.
   * @param {string} message - Pesan user
   * @param {Array}  history - Histori percakapan [{role, content}]
   * @param {string} lang    - Bahasa saat ini ("id" | "en")
   * @returns {Promise<string>} - Balasan dari AI
   */
  const sendMessage = useCallback(async (message, history = [], lang = 'id') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/chat', { message, history, lang });
      return res.data.reply;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'AI tidak tersedia saat ini.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendMessage, loading, error };
};
