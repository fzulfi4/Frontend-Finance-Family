import { useState, useEffect } from 'react';
import { WalletCards } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AddDebtModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: 'payable',
    name: '',
    amount: '',
    due_date: '',
    notes: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      const fetchedAccounts = res.data.data || [];
      setAccounts(fetchedAccounts);
      if (fetchedAccounts.length > 0) {
        setAccountId(fetchedAccounts[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setError(t('pleaseSelectWallet') || 'Silakan pilih dompet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/debts', {
        ...formData,
        account_id: accountId,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date ? formData.due_date : undefined
      });

      setFormData({ type: 'payable', name: '', amount: '', due_date: '', notes: '' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create debt record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('recordNewDebt')}
      icon={WalletCards}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('debtType')}</label>
          <div className="flex gap-3">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.type === 'payable'
                  ? 'bg-accent-red text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setFormData({ ...formData, type: 'payable' })}
            >
              {t('iOweSomeone')}
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.type === 'receivable'
                  ? 'bg-accent-green text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setFormData({ ...formData, type: 'receivable' })}
            >
              {t('someoneOwesMe')}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">{t('personOrgName')}</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder={t('egJohnDoe')}
            value={formData.name}
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
          <label className="input-label">{t('dueDateOptional')}</label>
          <DatePicker
            selected={formData.due_date ? new Date(formData.due_date) : null}
            onChange={(date) => {
              if (date) {
                const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                setFormData({ ...formData, due_date: offsetDate.toISOString().split('T')[0] });
              } else {
                setFormData({ ...formData, due_date: '' });
              }
            }}
            className="input-field"
            dateFormat="yyyy-MM-dd"
            isClearable
            placeholderText={t('selectDate')}
          />
        </div>

        <div>
          <label className="input-label">{t('notesOptional')}</label>
          <input
            type="text"
            name="notes"
            className="input-field"
            placeholder={t('addSomeDetails')}
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="input-label">{t('selectWallet') || 'Pilih Dompet'}</label>
          <select
            className="input-field"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="" disabled>{t('selectWalletPlaceholder') || 'Pilih Dompet'}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? t('saving') : t('saveDebt')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddDebtModal;
