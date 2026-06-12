import { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const TransferModal = ({ isOpen, onClose, onSuccess, accounts }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    account_id: '',
    to_account_id: '',
    notes: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0 && !formData.account_id) {
        setFormData(prev => ({ ...prev, account_id: accounts[0].id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_id || !formData.to_account_id) {
      setError(t('pleaseSelectWallet'));
      return;
    }

    if (formData.account_id === formData.to_account_id) {
      setError(t('pleaseSelectDifferentWallets'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions', {
        ...formData,
        type: 'transfer',
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date
      });
      setFormData({
        account_id: accounts[0]?.id || '',
        to_account_id: '',
        notes: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('transferBalance')}
      icon={ArrowRightLeft}
      iconColor="text-accent-blue"
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('fromWallet')}</label>
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

        <div className="flex justify-center my-2">
            <ArrowRightLeft className="text-gray-500" size={20} />
        </div>

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
          <label className="input-label">{t('titleNotes')}</label>
          <input
            type="text"
            name="notes"
            className="input-field"
            placeholder={t('transfer')}
            value={formData.notes}
            onChange={handleChange}
          />
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

export default TransferModal;
