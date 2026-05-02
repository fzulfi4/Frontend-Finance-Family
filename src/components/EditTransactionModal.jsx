import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, ArrowRightLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useTranslation } from 'react-i18next';

const EditTransactionModal = ({ isOpen, onClose, transaction, updateTransaction, deleteTransaction }) => {
  const { categories: allCategories } = useCategories(isOpen);
  const { wallets: accounts } = useWallets(isOpen);
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    account_id: '',
    to_account_id: '',
    category_id: '',
    type: 'expense',
    notes: '',
    amount: '',
    transaction_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const categories = allCategories.filter(cat => cat.type === formData.type);

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        account_id: transaction.account_id || '',
        to_account_id: transaction.to_account_id || '',
        category_id: transaction.category_id || '',
        type: transaction.type || 'expense',
        notes: transaction.notes || '',
        amount: transaction.amount,
        transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : '',
      });
      setError('');
      setShowConfirmDelete(false);
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_id) {
      setError(t('pleaseSelectWallet'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await updateTransaction(transaction.id, {
        account_id: formData.account_id,
        to_account_id: formData.type === 'transfer' ? formData.to_account_id : undefined,
        category_id: formData.type !== 'transfer' && formData.category_id ? formData.category_id : undefined,
        type: formData.type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date ? formData.transaction_date : undefined,
        notes: formData.notes
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!transaction) return null;

  const isIncome = formData.type === 'income';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editTransaction')}
      icon={formData.type === 'transfer' ? ArrowRightLeft : isIncome ? ArrowUpRight : ArrowDownRight}
      iconColor={formData.type === 'transfer' ? 'text-accent-blue' : isIncome ? 'text-accent-green' : 'text-accent-red'}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('transactionType')}</label>
          <select 
            name="type"
            className="input-field"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="expense">{t('expense')}</option>
            <option value="income">{t('income')}</option>
            <option value="transfer">{t('transfer')}</option>
          </select>
        </div>

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

        {formData.type === 'transfer' ? (
          <div>
            <label className="input-label">{t('toWallet')}</label>
            <select 
              name="to_account_id"
              className="input-field"
              value={formData.to_account_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>{t('selectToWalletPlaceholder')}</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)})</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="input-label">{t('category')}</label>
            <select 
              name="category_id"
              className="input-field"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">{t('noCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            <button 
              type="button" 
              className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
              onClick={() => setShowConfirmDelete(true)}
              title={t('deleteTransaction')}
            >
              <Trash2 size={20} />
            </button>
            <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || deleteLoading}>
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        ) : (
          <div className="pt-4 p-4 border border-red-500/30 rounded-xl bg-red-500/5 mt-4">
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteTransactionConfirm')}</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="btn border border-red-500 text-white bg-accent-red hover:bg-red-600 flex-1"
                onClick={handleDelete}
                disabled={deleteLoading || loading}
              >
                {deleteLoading ? t('deleting') : t('yesDelete')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary flex-1"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleteLoading}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default EditTransactionModal;
