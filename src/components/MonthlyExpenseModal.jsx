import { useState, useEffect } from 'react';
import { CalendarClock, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useCategories } from '../hooks/useCategories';
const MonthlyExpenseModal = ({ isOpen, onClose, expense, createExpense, updateExpense, deleteExpense }) => {
  const { categories: allCategories } = useCategories(isOpen);
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    amount: '',
    priority: 'fixed',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const categories = allCategories.filter(cat => cat.type === 'expense');

  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        category_id: expense.category_id || '',
        name: expense.name || '',
        amount: expense.amount,
        priority: expense.priority || 'fixed',
        is_active: expense.is_active ?? true,
      });
      setError('');
      setShowConfirmDelete(false);
    } else if (!expense && isOpen) {
      setFormData({
        category_id: '',
        name: '',
        amount: '',
        priority: 'fixed',
        is_active: true,
      });
      setError('');
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || undefined,
      };

      if (expense) {
        await updateExpense(expense.id, data);
      } else {
        await createExpense(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save monthly expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteExpense(expense.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete monthly expense');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Pengeluaran Bulanan' : 'Tambah Pengeluaran Bulanan'}
      icon={CalendarClock}
      iconColor="text-accent-blue"
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Nama Pengeluaran</label>
          <input 
            type="text" 
            name="name"
            className="input-field" 
            placeholder="Misal: Listrik, Netflix, Kos" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">Jumlah (IDR)</label>
          <CurrencyInput
            value={formData.amount}
            onChange={(num) => setFormData(prev => ({ ...prev, amount: num }))}
            required
            min={1}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Tipe Prioritas</label>
            <select 
              name="priority"
              className="input-field"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="fixed">Pasti (Wajib)</option>
              <option value="optional">Opsional (Keinginan)</option>
            </select>
          </div>
          <div>
            <label className="input-label">Kategori</label>
            <select 
              name="category_id"
              className="input-field"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Tanpa Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <input 
            type="checkbox" 
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-accent-blue focus:ring-accent-blue bg-transparent"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-200 cursor-pointer">
            Status Aktif
          </label>
        </div>

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            {expense && (
              <button 
                type="button" 
                className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
                onClick={() => setShowConfirmDelete(true)}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || deleteLoading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        ) : (
          <div className="pt-4 p-4 border border-red-500/30 rounded-xl bg-red-500/5 mt-4">
            <p className="text-sm text-gray-300 mb-4 text-center">Hapus pengeluaran bulanan ini?</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="btn border border-red-500 text-white bg-accent-red hover:bg-red-600 flex-1"
                onClick={handleDelete}
                disabled={deleteLoading || loading}
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary flex-1"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleteLoading}
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default MonthlyExpenseModal;
