import { useState, useEffect } from 'react';
import { CalendarClock, Trash2, Wallet } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MonthlyIncomeModal = ({ isOpen, onClose, income, createIncome, updateIncome, deleteIncome }) => {
  const { user } = useContext(AuthContext);
  const { categories: allCategories } = useCategories(isOpen);
  const { wallets } = useWallets(!!user?.family_id);

  const [formData, setFormData] = useState({
    category_id: '',
    account_id: '',
    name: '',
    amount: '',
    priority: 'fixed',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const categories = allCategories.filter(cat => cat.type === 'income');

  useEffect(() => {
    if (income && isOpen) {
      setFormData({
        category_id: income.category_id || '',
        account_id: income.account_id || '',
        name: income.name || '',
        amount: income.amount,
        priority: income.priority || 'fixed',
        is_active: income.is_active ?? true,
      });
      setError('');
      setShowConfirmDelete(false);
    } else if (!income && isOpen) {
      setFormData({
        category_id: '',
        account_id: '',
        name: '',
        amount: '',
        priority: 'fixed',
        is_active: true,
      });
      setError('');
    }
  }, [income, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || undefined,
        account_id: formData.account_id || undefined,
      };

      if (income) {
        await updateIncome(income.id, data);
      } else {
        await createIncome(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save monthly income');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteIncome(income.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete monthly income');
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
      title={income ? 'Edit Pemasukan Bulanan' : 'Tambah Pemasukan Bulanan'}
      icon={CalendarClock}
      iconColor="text-accent-green"
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Nama Pemasukan</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder="Misal: Gaji Pokok, Dividen, Investasi"
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

        {/* Wallet association */}
        <div>
          <label className="input-label flex items-center gap-1.5">
            <Wallet size={12} className="text-accent-green" />
            Dompet Terkait
            <span className="text-[10px] text-gray-500 font-normal ml-1">(opsional — kosong = semua dompet)</span>
          </label>
          <select
            name="account_id"
            className="input-field"
            value={formData.account_id}
            onChange={handleChange}
          >
            <option value="">🌐 Semua Dompet (Global)</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>💳 {w.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
            Jika dipilih, target ini hanya akan menghitung transaksi pemasukan dari dompet yang terpilih.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-accent-green focus:ring-accent-green bg-transparent"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-200 cursor-pointer">
            Status Aktif
          </label>
        </div>

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            {income && (
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
            <p className="text-sm text-gray-300 mb-4 text-center">Hapus pemasukan bulanan ini?</p>
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

export default MonthlyIncomeModal;
