import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useCategories } from '../hooks/useCategories';
import { useTranslation } from 'react-i18next';

const AddTransactionModal = ({ isOpen, onClose, onSuccess, accounts, type = 'expense' }) => {
  const { categories: allCategories, createCategory } = useCategories(isOpen);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    notes: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = allCategories.filter(cat => cat.type === type);

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0 && !formData.account_id) {
        setFormData(prev => ({ ...prev, account_id: accounts[0].id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accounts]);

  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, formData.category_id]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategory({ name: newCategoryName, type, icon: '' });
      setFormData(prev => ({ ...prev, category_id: newCat.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_id || !formData.category_id) {
      setError(t('pleaseSelectWalletAndCategory'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions', {
        ...formData,
        type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date
      });
      setFormData({
        account_id: accounts[0]?.id || '',
        category_id: categories[0]?.id || '',
        notes: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isIncome = type === 'income';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? t('addIncome') : t('addExpense')}
      icon={isIncome ? ArrowUpRight : ArrowDownRight}
      iconColor={isIncome ? 'text-accent-green' : 'text-accent-red'}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('titleNotes')}</label>
          <input
            type="text"
            name="notes"
            className="input-field"
            placeholder={isIncome ? t('egSalary') : t('egGroceries')}
            value={formData.notes}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('amountIdr')}</label>
          <CurrencyInput
            value={formData.amount}
            onChange={(num) => setFormData(prev => ({ ...prev, amount: num }))}
            required
            min={1}
          />
        </div>

        <div>
          <label className="input-label">{t('date')}</label>
          <DatePicker
            selected={formData.transaction_date ? new Date(formData.transaction_date) : null}
            onChange={(date) => {
              if (date) {
                const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                setFormData({ ...formData, transaction_date: offsetDate.toISOString().split('T')[0] });
              } else {
                setFormData({ ...formData, transaction_date: '' });
              }
            }}
            className="input-field"
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>

        <div>
          <label className="input-label">{t('selectWallet')}</label>
          <select
            name="account_id"
            className="input-field"
            value={formData.account_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>{t('selectWalletPlaceholder')}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)})</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-400">{t('category')}</label>
            <button
              type="button"
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="text-xs text-accent-blue hover:text-blue-400 transition-colors"
            >
              {t('newCategoryBtn')}
            </button>
          </div>

          {showNewCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder={t('categoryName')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={handleCreateCategory}>{t('addBtn')}</button>
            </div>
          ) : (
            <select
              name="category_id"
              className="input-field"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>{t('selectCategoryPlaceholder')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? t('saving') : t('saveTransaction')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddTransactionModal;
